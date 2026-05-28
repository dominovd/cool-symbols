// Vercel Serverless Function — Anthropic Claude proxy with KV-backed cost protection.
//
// Required environment variables:
//   ANTHROPIC_API_KEY     — your Anthropic API key (sk-ant-...)
//
// Strongly recommended (cost protection):
//   KV_REST_API_URL       — auto-injected when you link a Vercel KV store
//   KV_REST_API_TOKEN     — auto-injected when you link a Vercel KV store
//
// Optional:
//   DAILY_BUDGET_USD      — global daily AI spend cap in USD (default: 3)

const MODEL = 'claude-haiku-4-5-20251001';
const DAILY_LIMIT_PER_IP = 20;
const MAX_INPUT_LENGTH = 300;

// $3 default budget cap. Stored as milli-cents (1/1000 of a cent) for integer math.
const BUDGET_USD = parseFloat(process.env.DAILY_BUDGET_USD || '3');
const BUDGET_MILLICENTS = Math.floor(BUDGET_USD * 100 * 1000);

// Claude Haiku 4.5 pricing in milli-cents per token.
// $0.80/MTok input  → 80 cents / 1M tokens → 0.08 milli-cents/token
// $4.00/MTok output → 400 cents / 1M tokens → 0.4 milli-cents/token
const INPUT_MILLICENTS_PER_TOKEN = 0.08;
const OUTPUT_MILLICENTS_PER_TOKEN = 0.4;

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_ENABLED = !!(KV_URL && KV_TOKEN);

if (!KV_ENABLED) {
  console.warn(
    '[generate] KV not configured. Falling back to in-memory rate limit. ' +
    'This is NOT safe for production — connect a Vercel KV store before going live.'
  );
}

// In-memory fallback (local dev only).
const memoryStore = new Map();
const TTL_SECONDS = 86400 * 2; // 2 days

async function kvCmd(path) {
  const r = await fetch(`${KV_URL}/${path}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`KV HTTP ${r.status}`);
  const data = await r.json();
  return data.result;
}

async function getCounter(key) {
  if (!KV_ENABLED) return memoryStore.get(key) || 0;
  const v = await kvCmd(`get/${encodeURIComponent(key)}`);
  return v == null ? 0 : parseInt(v, 10) || 0;
}

async function incrBy(key, amount, ttlSeconds) {
  if (!KV_ENABLED) {
    const v = (memoryStore.get(key) || 0) + amount;
    memoryStore.set(key, v);
    return v;
  }
  const newVal = await kvCmd(`incrby/${encodeURIComponent(key)}/${amount}`);
  const n = parseInt(newVal, 10);
  if (n === amount && ttlSeconds) {
    // First write — set TTL so the key auto-expires
    await kvCmd(`expire/${encodeURIComponent(key)}/${ttlSeconds}`).catch(() => {});
  }
  return n;
}

const todayUTC = () => new Date().toISOString().slice(0, 10);

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function tokenCostMillicents(usage) {
  return Math.ceil(
    (usage.input_tokens || 0) * INPUT_MILLICENTS_PER_TOKEN +
    (usage.output_tokens || 0) * OUTPUT_MILLICENTS_PER_TOKEN
  );
}

// ============= MODE-SPECIFIC PROMPTS =============
const MODE_CONFIGS = {
  ascii: {
    system: `You are an ASCII/Unicode art generator. The user names an object or scene.
Return ONLY the art — no preamble, no explanation, no markdown fences.
Use plain ASCII and common Unicode box/line characters. Avoid emoji unless explicitly requested.
Constraints:
- Maximum 14 rows tall
- Maximum 40 characters wide
- Recognizable silhouette of the subject
- If the subject is unclear or inappropriate, return a stylized question mark instead.`,
    buildUser: (inp) => `Draw: ${inp.subject}`,
    maxTokens: 700,
  },
  names: {
    system: `You generate stylish, copy-paste usernames decorated with Unicode symbols.
Return EXACTLY 10 usernames, one per line, no numbering, no explanation.
Vary the decoration: combining symbols, brackets, arrows, stars, special letterforms (𝓐𝔅ℂ𝔻 𝙰𝙱𝙲), zalgo lightly, etc.
Match the theme the user specifies (gaming = aggressive/dark; kawaii = soft/hearts; royal = ornate; neon = bright/symmetric; etc.).
If the user provides a base name, stylize that name 10 different ways. Otherwise invent fitting names.
Keep each name under 20 visible characters. No slurs, no targeting real people.`,
    buildUser: (inp) => {
      const theme = inp.theme || 'cool';
      const base = inp.base ? ` Base name to stylize: "${inp.base}".` : '';
      return `Theme: ${theme}.${base}`;
    },
    maxTokens: 600,
  },
  bio: {
    system: `You write short aesthetic bios for social media profiles (Instagram, TikTok, Telegram).
Return ONLY the bio — no preamble, no explanation, no markdown fences.
Constraints:
- 4 to 6 lines
- Use Unicode dividers, decorative symbols, and at most 3 relevant emojis
- Match the user's vibe (cozy, edgy, professional, dreamy, etc.)
- English unless user writes in another language
- Each line under 30 characters when possible`,
    buildUser: (inp) => `Make a bio for: ${inp.about}`,
    maxTokens: 500,
  },
  logo: {
    system: `You render short words as block-character ASCII logos.
Return ONLY the logo — no preamble, no explanation, no markdown fences.
Use block-drawing characters (█ ▀ ▄ ▌ ▐ ░ ▒ ▓) to draw each letter, roughly 5 rows tall.
If the word is longer than 8 characters, render it in a more compact stylized form using ║ ╔ ╗ ╚ ╝ or similar.
Letters should be recognizable. No emoji.`,
    buildUser: (inp) => `Word: ${inp.word}`,
    maxTokens: 700,
  },
  stylize: {
    system: `You stylize plain text with relevant decorative Unicode symbols and tasteful emoji.
Return ONLY the stylized version — no preamble, no explanation, no quotes around it.
Choose symbols that match the mood the user specifies (cute = ♡ ⋆ 𓂃; dark = ☾ ☠ ✧; royal = ♛ ⚜ ❦; retro = ▼ ▲ ░; witchy = ☽ ✦ ✺).
Keep the original words readable. Add 4-8 decorative elements distributed around or between words.
At most 2 emoji.`,
    buildUser: (inp) => {
      const mood = inp.mood || 'aesthetic';
      return `Text: ${inp.text}\nMood: ${mood}`;
    },
    maxTokens: 300,
  },
  pixel: {
    system: `You draw small pixel art using block characters.
Return ONLY the art — no preamble, no explanation, no markdown fences.
Use ONLY these characters: █ ▀ ▄ ▌ ▐ ░ ▒ ▓ ■ □ and spaces.
Constraints:
- Maximum 12 rows tall, 20 columns wide
- Clearly recognizable silhouette of the subject
- Symmetric where natural (faces, hearts)`,
    buildUser: (inp) => `Pixel art of: ${inp.subject}`,
    maxTokens: 500,
  },
};

// ============= HANDLER =============
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { mode, inputs } = body || {};
  const config = MODE_CONFIGS[mode];
  if (!config) return res.status(400).json({ error: 'Unknown mode' });
  if (!inputs || typeof inputs !== 'object') return res.status(400).json({ error: 'Missing inputs' });

  for (const v of Object.values(inputs)) {
    if (typeof v === 'string' && v.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ error: `Input too long (max ${MAX_INPUT_LENGTH} chars)` });
    }
  }

  const primaryInput = Object.values(inputs).find(v => v && typeof v === 'string' && v.trim());
  if (!primaryInput) return res.status(400).json({ error: 'Input is empty' });

  const today = todayUTC();
  const ip = getClientIp(req);

  // ===== 1. Global daily budget check (FAIL CLOSED — protects from runaway spend) =====
  let spentMc;
  try {
    spentMc = await getCounter(`budget:${today}`);
  } catch (err) {
    console.error('[generate] Budget check failed:', err.message);
    return res.status(503).json({
      error: 'AI service temporarily unavailable. The fancy text and symbol library still work — try those.',
      reason: 'budget_check_failed',
    });
  }
  if (spentMc >= BUDGET_MILLICENTS) {
    const spentUsd = (spentMc / 100000).toFixed(2);
    return res.status(503).json({
      error: `Daily AI quota reached ($${spentUsd} of $${BUDGET_USD.toFixed(2)} spent). Resets at midnight UTC. The fancy text generator and symbol library are unlimited and still work.`,
      reason: 'budget_exhausted',
    });
  }

  // ===== 2. Per-IP daily rate limit (atomic INCR — fail-open via in-memory fallback) =====
  let ipCount;
  try {
    ipCount = await incrBy(`rl:${ip}:${today}`, 1, TTL_SECONDS);
  } catch (err) {
    console.warn('[generate] IP limit KV failed, using in-memory fallback:', err.message);
    const k = `rl:${ip}:${today}`;
    ipCount = (memoryStore.get(k) || 0) + 1;
    memoryStore.set(k, ipCount);
  }
  if (ipCount > DAILY_LIMIT_PER_IP) {
    return res.status(429).json({
      error: `Daily limit reached. You get ${DAILY_LIMIT_PER_IP} free AI generations per day; resets at midnight UTC. The symbol library and fancy fonts have no limit — keep exploring those.`,
      reason: 'ip_limit',
      remaining: 0,
    });
  }

  const remaining = DAILY_LIMIT_PER_IP - ipCount;

  // ===== 3. Call Anthropic =====
  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
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

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('[generate] Anthropic API error:', aiRes.status, errText);
      return res.status(502).json({
        error: 'AI service unavailable. Try again in a moment.',
        remaining,
      });
    }

    const data = await aiRes.json();
    const text = (data.content?.[0]?.text || '').trim();
    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI', remaining });
    }

    // ===== 4. Record actual spend (best-effort — don't fail the user request if KV write fails) =====
    const cost = tokenCostMillicents(data.usage || {});
    if (cost > 0) {
      incrBy(`budget:${today}`, cost, TTL_SECONDS).catch(err =>
        console.error('[generate] Spend record failed:', err.message)
      );
    }

    return res.status(200).json({ text, remaining });
  } catch (err) {
    console.error('[generate] Generation error:', err);
    return res.status(500).json({
      error: 'Generation failed. Try again.',
      remaining,
    });
  }
};
