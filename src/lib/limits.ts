import { envVar } from './env';

/**
 * AI usage limits. Imported by the API route to enforce them and by the home
 * page to render the initial counter, so the number a visitor sees can never
 * disagree with the number the server applies.
 */

function readNumber(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(raw ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Generations per IP per UTC day. */
export const DAILY_LIMIT_PER_IP = Math.floor(readNumber(envVar('DAILY_LIMIT_PER_IP'), 3));

/** Hard ceiling on total AI spend per UTC day, in USD. */
export const DAILY_BUDGET_USD = readNumber(envVar('DAILY_BUDGET_USD'), 3);
