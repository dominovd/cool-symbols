/**
 * Reads a server-side environment variable.
 *
 * `process.env` comes first because that is what Vercel populates at runtime
 * and what plain Node (tests, scripts) sees. `import.meta.env` is the fallback
 * so `.env.local` keeps working under `astro dev`, and it is accessed
 * defensively because it does not exist outside Vite.
 */
const VITE_ENV: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && (import.meta as ImportMeta).env) || {};

export function envVar(key: string): string | undefined {
  return process.env[key] ?? VITE_ENV[key];
}
