import { BuildDataApiError } from "./types";

export type RetryOutcome =
  | { action: "use"; value: unknown }
  | { action: "skip"; reason: string }
  | { action: "restricted"; reason: string }
  | { action: "failed"; reason: string };

const MAX_ATTEMPTS = 4;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelayMs(attempt: number): number {
  const base = 500 * 2 ** attempt;
  const jitter = Math.random() * base * 0.25;
  return base + jitter;
}

/**
 * Calls `fn` with status-specific handling per BuildData's documented
 * behavior: 400/422 malformed input (skip, no retry); 403 restricted (a
 * free-tier 403 on recent records is NOT proof they don't exist); 404 not
 * found (skip); 429 backoff honoring Retry-After; 500/504 retry with a
 * capped attempt count, then fail.
 */
export async function withRetry(fn: () => Promise<unknown>): Promise<RetryOutcome> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const value = await fn();
      return { action: "use", value };
    } catch (err) {
      if (!(err instanceof BuildDataApiError)) throw err;

      if (err.status === 400 || err.status === 422) {
        return { action: "skip", reason: `${err.status}: ${err.message}` };
      }
      if (err.status === 403) {
        return { action: "restricted", reason: err.message };
      }
      if (err.status === 404) {
        return { action: "skip", reason: err.message };
      }
      if (err.status === 429 || err.status === 500 || err.status === 504) {
        if (attempt === MAX_ATTEMPTS - 1) {
          return { action: "failed", reason: `${err.status} after ${MAX_ATTEMPTS} attempts` };
        }
        const retryAfterHeader =
          err.body && typeof err.body === "object" && "retry_after" in err.body
            ? Number((err.body as Record<string, unknown>).retry_after)
            : undefined;
        const delay = retryAfterHeader && Number.isFinite(retryAfterHeader)
          ? retryAfterHeader * 1000
          : backoffDelayMs(attempt);
        await sleep(delay);
        continue;
      }
      return { action: "failed", reason: `unexpected status ${err.status}: ${err.message}` };
    }
  }
  return { action: "failed", reason: "exhausted retry attempts" };
}
