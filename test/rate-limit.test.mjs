/**
 * Exercises the real /api/generate handler against an in-memory Upstash stub.
 *
 * Run with: node test/rate-limit.test.mjs
 *
 * Covers the two guards that protect the Anthropic bill:
 *   1. per-IP daily limit
 *   2. global daily budget cap, including its fail-closed behaviour
 */

import assert from 'node:assert/strict';

process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
process.env.KV_REST_API_URL = 'https://kv.test';
process.env.KV_REST_API_TOKEN = 'test-token';
process.env.DAILY_LIMIT_PER_IP = '3';
process.env.DAILY_BUDGET_USD = '3';

// ---------------------------------------------------------------- stubs

/** Minimal Redis emulation covering the three commands the route issues. */
const store = new Map();
let kvShouldFail = false;
let anthropicCalls = 0;

globalThis.fetch = async (url, init) => {
  const href = String(url);

  if (href.startsWith('https://kv.test/')) {
    if (kvShouldFail) throw new Error('KV unreachable');
    const [command, rawKey, rawArg] = href.replace('https://kv.test/', '').split('/');
    const key = decodeURIComponent(rawKey);

    if (command === 'get') {
      return json({ result: store.has(key) ? String(store.get(key)) : null });
    }
    if (command === 'incrby') {
      const next = (store.get(key) ?? 0) + Number(rawArg);
      store.set(key, next);
      return json({ result: next });
    }
    if (command === 'expire') {
      return json({ result: 1 });
    }
    throw new Error(`unexpected KV command: ${command}`);
  }

  if (href === 'https://api.anthropic.com/v1/messages') {
    anthropicCalls += 1;
    return json({
      content: [{ text: ' /\\_/\\\n( o.o )' }],
      usage: { input_tokens: 400, output_tokens: 500 },
    });
  }

  throw new Error(`unexpected fetch: ${href}`);
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// ---------------------------------------------------------------- helpers

const { POST } = await import('../src/pages/api/generate.ts');

function callAs(ip, mode = 'ascii', inputs = { subject: 'cat' }) {
  const request = new Request('https://cool-symbols.net/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({ mode, inputs }),
  });
  return POST({ request });
}

function reset() {
  store.clear();
  kvShouldFail = false;
  anthropicCalls = 0;
}

let passed = 0;
async function test(name, fn) {
  reset();
  await fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

// ---------------------------------------------------------------- tests

console.log('\nrate limiting\n');

await test('allows exactly 3 generations then blocks the 4th', async () => {
  const ip = '203.0.113.10';

  for (let i = 1; i <= 3; i++) {
    const response = await callAs(ip);
    const body = await response.json();
    assert.equal(response.status, 200, `call ${i} should succeed`);
    assert.equal(body.remaining, 3 - i, `call ${i} should report ${3 - i} remaining`);
    assert.ok(body.text, `call ${i} should return text`);
  }

  const blocked = await callAs(ip);
  const body = await blocked.json();
  assert.equal(blocked.status, 429);
  assert.equal(body.reason, 'ip_limit');
  assert.equal(body.remaining, 0);
  assert.match(body.error, /3 free AI generations per day/);
  assert.equal(anthropicCalls, 3, 'the blocked call must not reach Anthropic');
});

await test('keeps counting separately per IP', async () => {
  await callAs('198.51.100.1');
  await callAs('198.51.100.1');
  await callAs('198.51.100.1');

  const blocked = await callAs('198.51.100.1');
  assert.equal(blocked.status, 429);

  const other = await callAs('198.51.100.2');
  assert.equal(other.status, 200, 'a different IP has its own allowance');
});

await test('takes the first address from a proxy chain', async () => {
  const request = new Request('https://cool-symbols.net/api/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.55, 70.41.3.18, 150.172.238.178',
    },
    body: JSON.stringify({ mode: 'ascii', inputs: { subject: 'cat' } }),
  });
  await POST({ request });
  const key = [...store.keys()].find((k) => k.startsWith('rl:'));
  assert.equal(key.split(':')[1], '203.0.113.55');
});

await test('records real token spend against the budget', async () => {
  await callAs('203.0.113.77');
  const budgetKey = [...store.keys()].find((k) => k.startsWith('budget:'));
  // 400 input * 0.08 + 500 output * 0.4 = 232 milli-cents
  assert.equal(store.get(budgetKey), 232);
});

await test('blocks everyone once the daily budget is exhausted', async () => {
  const today = new Date().toISOString().slice(0, 10);
  store.set(`budget:${today}`, 300_000); // $3.00 in milli-cents

  const response = await callAs('203.0.113.90');
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.reason, 'budget_exhausted');
  assert.equal(anthropicCalls, 0, 'no Anthropic call once the budget is spent');
});

await test('keeps serving on a reduced cap when the counter is unreachable', async () => {
  kvShouldFail = true;

  const response = await callAs('203.0.113.98');
  const body = await response.json();
  assert.equal(response.status, 200, 'a KV outage must not kill the feature');
  assert.ok(body.text);
  assert.equal(anthropicCalls, 1);
});

await test('still enforces the per-IP limit while the counter is unreachable', async () => {
  kvShouldFail = true;
  const ip = '203.0.113.97';

  for (let i = 0; i < 3; i++) {
    assert.equal((await callAs(ip)).status, 200);
  }
  assert.equal((await callAs(ip)).status, 429, 'the memory fallback must still count');
});

await test('caps degraded mode at $0.25 per instance', async () => {
  kvShouldFail = true;
  // 232 milli-cents per call, so the $0.25 (25000) ceiling allows ~107 calls.
  // Use a fresh IP each time so the per-IP limit is not what stops us.
  let allowed = 0;
  for (let i = 0; i < 200; i++) {
    const response = await callAs(`198.18.${Math.floor(i / 250)}.${i % 250}`);
    if (response.status === 200) allowed += 1;
    else {
      const body = await response.json();
      assert.equal(body.reason, 'budget_exhausted');
      break;
    }
  }
  assert.ok(allowed > 50 && allowed < 120, `expected roughly 107 calls, got ${allowed}`);
  assert.ok(anthropicCalls <= 120, 'degraded mode must stay bounded');
});

await test('rejects oversized input before spending anything', async () => {
  const response = await callAs('203.0.113.120', 'ascii', { subject: 'x'.repeat(301) });
  assert.equal(response.status, 400);
  assert.equal(anthropicCalls, 0);
});

await test('rejects an unknown mode', async () => {
  const response = await callAs('203.0.113.121', 'not-a-mode', { subject: 'cat' });
  assert.equal(response.status, 400);
  assert.equal(anthropicCalls, 0);
});

console.log(`\n${passed} passed\n`);
