// Vercel Serverless Function — Anthropic Claude proxy with IP-based rate limiting.
// Required environment variable: ANTHROPIC_API_KEY (set in Vercel → Project → Settings → Environment Variables)

const MODEL = 'claude-haiku-4-5-20251001';
const DAILY_LIMIT = 20;
const MAX_INPUT_LENGTH = 300;

// In-memory rate limit store. Survives between invocations on the same warm instance.
// Not perfectly accurate (resets on cold start / per-region), but good enough for a free tier.
const limits = new Map();

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function checkAndIncrement(ip) {
  const today = getTodayKey();
  const key = `${ip}|${today}`;
  const count = limits.get(key) || 0;
  if (count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  limits.set(key, count + 1);
  // Cleanup old keys occasionally
  if (limits.size > 5000) {
    for (const k of limits.keys()) {
      if (!k.endsWith(today)) limits.delete(k);
    }
  }
  return { allowed: true, remaining: DAILY_LIMIT - (count + 1) };
}

function peekRemaining(ip) {
  const count = limits.get(`${ip}|${getTodayKey()}`) || 0;
  return Math.max(0, DAILY_LIMIT - count);
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
  // CORS (only same-origin needed in prod, but useful for local testing)
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

  // Validate input length to prevent abuse
  for (const v of Object.values(inputs)) {
    if (typeof v === 'string' && v.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ error: `Input too long (max ${MAX_INPUT_LENGTH} chars)` });
    }
  }

  const primaryInput = Object.values(inputs).find(v => v && typeof v === 'string' && v.trim());
  if (!primaryInput) return res.status(400).json({ error: 'Input is empty' });

  // Rate limit
  const ip = getClientIp(req);
  const limit = checkAndIncrement(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Daily limit reached. You get ${DAILY_LIMIT} free AI generations per day. Try the symbol library below — it's unlimited.`,
      remaining: 0,
    });
  }

  // Call Anthropic
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
      console.error('Anthropic API error:', aiRes.status, errText);
      return res.status(502).json({
        error: 'AI service unavailable. Try again in a moment.',
        remaining: peekRemaining(ip),
      });
    }

    const data = await aiRes.json();
    const text = (data.content?.[0]?.text || '').trim();
    if (!text) {
      return res.status(502).json({ error: 'Empty response from AI', remaining: peekRemaining(ip) });
    }

    return res.status(200).json({ text, remaining: limit.remaining });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({
      error: 'Generation failed. Try again.',
      remaining: peekRemaining(ip),
    });
  }
};
