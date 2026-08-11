import type { APIRoute } from 'astro';

/**
 * Anthropic proxy with two independent spend guards.
 *
 * Required environment variables:
 *   ANTHROPIC_API_KEY
 *
 * Strongly recommended (cost protection). Either naming convention works, so
 * this runs on both the legacy Vercel KV integration and the current Upstash
 * Marketplace integration:
 *   KV_REST_API_URL / KV_REST_API_TOKEN
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *
 * Optional:
 *   DAILY_BUDGET_USD  global daily AI spend cap in USD (default: 3)
 */
export const prerender = false;

const MODEL = 'claude-haiku-4-5-20251001';
const DAILY_LIMIT_PER_IP = 20;
const MAX_INPUT_LENGTH = 300;
const TTL_SECONDS = 86_400 * 2;

const BUDGET_USD = Number.parseFloat(import.meta.env.DAILY_BUDGET_USD ?? process.env.DAILY_BUDGET_USD ?? '3');
// Tracked in milli-cents so the counter stays integer-only.
const BUDGET_MILLICENTS = Math.floor(BUDGET_USD * 100 * 1000);

// Claude Haiku 4.5: $0.80/MTok in, $4.00/MTok out.
const INPUT_MILLICENTS_PER_TOKEN = 0.08;
const OUTPUT_MILLICENTS_PER_TOKEN = 0.4;

const env = (key: string): string | undefined =>
  (import.meta.env as Record<string, string | undefined>)[key] ?? process.env[key];

const KV_URL = env('KV_REST_API_URL') ?? env('UPSTASH_REDIS_REST_URL');
const KV_TOKEN = env('KV_REST_API_TOKEN') ?? env('UPSTASH_REDIS_REST_TOKEN');
const KV_ENABLED = Boolean(KV_URL && KV_TOKEN);

// Only used when KV is unavailable (local dev). Per-instance, so it is not a
// real safeguard in production, hence the warning.
const memoryStore = new Map<string, number>();

if (!KV_ENABLED) {
  console.warn(
    '[generate] KV not configured. Falling back to in-memory rate limit. ' +
      'This is NOT safe for production: connect an Upstash Redis store before going live.'
  );
}

async function kvCmd(path: string): Promise<unknown> {
  const response = await fetch(`${KV_URL}/${path}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`KV HTTP ${response.status}`);
  const data = (await response.json()) as { result: unknown };
  return data.result;
}

async function getCounter(key: string): Promise<number> {
  if (!KV_ENABLED) return memoryStore.get(key) ?? 0;
  const value = await kvCmd(`get/${encodeURIComponent(key)}`);
  return value == null ? 0 : Number.parseInt(String(value), 10) || 0;
}

async function incrBy(key: string, amount: number, ttlSeconds?: number): Promise<number> {
  if (!KV_ENABLED) {
    const next = (memoryStore.get(key) ?? 0) + amount;
    memoryStore.set(key, next);
    return next;
  }
  const raw = await kvCmd(`incrby/${encodeURIComponent(key)}/${amount}`);
  const next = Number.parseInt(String(raw), 10);
  // First write for this key: attach the TTL so counters self-expire.
  if (next === amount && ttlSeconds) {
    await kvCmd(`expire/${encodeURIComponent(key)}/${ttlSeconds}`).catch(() => {});
  }
  return next;
}

const todayUTC = () => new Date().toISOString().slice(0, 10);

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function tokenCostMillicents(usage: { input_tokens?: number; output_tokens?: number }): number {
  return Math.ceil(
    (usage.input_tokens ?? 0) * INPUT_MILLICENTS_PER_TOKEN +
      (usage.output_tokens ?? 0) * OUTPUT_MILLICENTS_PER_TOKEN
  );
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

type ModeConfig = {
  system: string;
  buildUser: (inputs: Record<string, string>) => string;
  maxTokens: number;
};

const MODE_CONFIGS: Record<string, ModeConfig> = {
  ascii: {
    system: `You are an ASCII/Unicode art generator. The user names an object or scene.
Return ONLY the art, with no preamble, no explanation and no markdown fences.
Use plain ASCII and common Unicode box/line characters. Avoid emoji unless explicitly requested.
Constraints:
- Maximum 14 rows tall
- Maximum 40 characters wide
- Recognizable silhouette of the subject
- If the subject is unclear or inappropriate, return a stylized question mark instead.`,
    buildUser: (inputs) => `Draw: ${inputs.subject}`,
    maxTokens: 700,
  },
  names: {
    system: `You generate stylish, copy-paste usernames decorated with Unicode symbols.
Return EXACTLY 10 usernames, one per line, no numbering, no explanation.
Vary the decoration: combining symbols, brackets, arrows, stars, special letterforms, light zalgo.
Match the theme the user specifies (gaming = aggressive/dark; kawaii = soft/hearts; royal = ornate; neon = bright/symmetric).
If the user provides a base name, stylize that name 10 different ways. Otherwise invent fitting names.
Keep each name under 20 visible characters. No slurs, no targeting real people.`,
    buildUser: (inputs) => {
      const theme = inputs.theme || 'cool';
      const base = inputs.base ? ` Base name to stylize: "${inputs.base}".` : '';
      return `Theme: ${theme}.${base}`;
    },
    maxTokens: 600,
  },
  bio: {
    system: `You write short aesthetic bios for social media profiles (Instagram, TikTok, Telegram).
Return ONLY the bio, with no preamble, no explanation and no markdown fences.
Constraints:
- 4 to 6 lines
- Use Unicode dividers, decorative symbols, and at most 3 relevant emojis
- Match the user's vibe (cozy, edgy, professional, dreamy)
- English unless the user writes in another language
- Each line under 30 characters when possible`,
    buildUser: (inputs) => `Make a bio for: ${inputs.about}`,
    maxTokens: 500,
  },
  logo: {
    system: `You render short words as block-character ASCII logos.
Return ONLY the logo, with no preamble, no explanation and no markdown fences.
Use block-drawing characters to draw each letter, roughly 5 rows tall.
If the word is longer than 8 characters, render it in a more compact stylized form.
Letters should be recognizable. No emoji.`,
    buildUser: (inputs) => `Word: ${inputs.word}`,
    maxTokens: 700,
  },
  stylize: {
    system: `You stylize plain text with relevant decorative Unicode symbols and tasteful emoji.
Return ONLY the stylized version, with no preamble, no explanation and no surrounding quotes.
Choose symbols that match the mood the user specifies.
Keep the original words readable. Add 4-8 decorative elements distributed around or between words.
At most 2 emoji.`,
    buildUser: (inputs) => `Text: ${inputs.text}\nMood: ${inputs.mood || 'aesthetic'}`,
    maxTokens: 300,
  },
  pixel: {
    system: `You draw small pixel art using block characters.
Return ONLY the art, with no preamble, no explanation and no markdown fences.
Use ONLY block and shade characters plus spaces.
Constraints:
- Maximum 12 rows tall, 20 columns wide
- Clearly recognizable silhouette of the subject
- Symmetric where natural (faces, hearts)`,
    buildUser: (inputs) => `Pixel art of: ${inputs.subject}`,
    maxTokens: 500,
  },
};

export const POST: APIRoute = async ({ request }) => {
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json({ error: 'Server misconfigured: missing API key' }, 500);
  }

  let body: { mode?: string; inputs?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { mode, inputs } = body;
  const config = mode ? MODE_CONFIGS[mode] : undefined;
  if (!config) return json({ error: 'Unknown mode' }, 400);
  if (!inputs || typeof inputs !== 'object') return json({ error: 'Missing inputs' }, 400);

  for (const value of Object.values(inputs)) {
    if (typeof value === 'string' && value.length > MAX_INPUT_LENGTH) {
      return json({ error: `Input too long (max ${MAX_INPUT_LENGTH} chars)` }, 400);
    }
  }

  const primaryInput = Object.values(inputs).find((v) => typeof v === 'string' && v.trim());
  if (!primaryInput) return json({ error: 'Input is empty' }, 400);

  const today = todayUTC();
  const ip = getClientIp(request);

  // 1. Global daily budget. Fails CLOSED: if the counter cannot be read we
  //    refuse rather than risk unbounded spend.
  let spentMillicents: number;
  try {
    spentMillicents = await getCounter(`budget:${today}`);
  } catch (error) {
    console.error('[generate] Budget check failed:', error);
    return json(
      {
        error:
          'AI service temporarily unavailable. The fancy text and symbol library still work, try those.',
        reason: 'budget_check_failed',
      },
      503
    );
  }
  if (spentMillicents >= BUDGET_MILLICENTS) {
    const spentUsd = (spentMillicents / 100_000).toFixed(2);
    return json(
      {
        error: `Daily AI quota reached ($${spentUsd} of $${BUDGET_USD.toFixed(2)} spent). Resets at midnight UTC. The fancy text generator and symbol library are unlimited and still work.`,
        reason: 'budget_exhausted',
      },
      503
    );
  }

  // 2. Per-IP daily limit. Fails OPEN to the in-memory counter: a KV blip
  //    should degrade the limit, not take the feature down, and the budget cap
  //    above is still the hard ceiling.
  let ipCount: number;
  try {
    ipCount = await incrBy(`rl:${ip}:${today}`, 1, TTL_SECONDS);
  } catch (error) {
    console.warn('[generate] IP limit KV failed, using in-memory fallback:', error);
    const key = `rl:${ip}:${today}`;
    ipCount = (memoryStore.get(key) ?? 0) + 1;
    memoryStore.set(key, ipCount);
  }
  if (ipCount > DAILY_LIMIT_PER_IP) {
    return json(
      {
        error: `Daily limit reached. You get ${DAILY_LIMIT_PER_IP} free AI generations per day; resets at midnight UTC. The symbol library and fancy fonts have no limit, keep exploring those.`,
        reason: 'ip_limit',
        remaining: 0,
      },
      429
    );
  }

  const remaining = DAILY_LIMIT_PER_IP - ipCount;

  try {
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: config.maxTokens,
        system: config.system,
        messages: [{ role: 'user', content: config.buildUser(inputs) }],
      }),
    });

    if (!aiResponse.ok) {
      console.error('[generate] Anthropic API error:', aiResponse.status, await aiResponse.text());
      return json({ error: 'AI service unavailable. Try again in a moment.', remaining }, 502);
    }

    const data = (await aiResponse.json()) as {
      content?: Array<{ text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text = (data.content?.[0]?.text ?? '').trim();
    if (!text) return json({ error: 'Empty response from AI', remaining }, 502);

    // Record actual spend. Best effort: a failed write must not fail the
    // response the user already paid for.
    const cost = tokenCostMillicents(data.usage ?? {});
    if (cost > 0) {
      void incrBy(`budget:${today}`, cost, TTL_SECONDS).catch((error) =>
        console.error('[generate] Spend record failed:', error)
      );
    }

    return json({ text, remaining });
  } catch (error) {
    console.error('[generate] Generation error:', error);
    return json({ error: 'Generation failed. Try again.', remaining }, 500);
  }
};
