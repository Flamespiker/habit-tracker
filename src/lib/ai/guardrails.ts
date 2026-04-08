/** Result returned by every guardrail check. */
export type GuardrailResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 429 };

// ---------------------------------------------------------------------------
// Input length
// ---------------------------------------------------------------------------

const MAX_INPUT_LENGTH = 2000;

/**
 * Rejects inputs longer than 2000 characters.
 * Apply to any free-text field that flows into a prompt.
 */
export function checkInputLength(input: string): GuardrailResult {
  if (input.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      error: "Input too long — maximum 2000 characters",
      status: 400,
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Content filter
// ---------------------------------------------------------------------------

const INJECTION_PATTERNS = [
  "ignore previous instructions",
  "you are now",
  "disregard your",
  "new persona",
];

/**
 * Rejects inputs containing common prompt-injection phrases.
 * Comparison is case-insensitive.
 */
export function checkContentFilter(input: string): GuardrailResult {
  const lower = input.toLowerCase();
  for (const pattern of INJECTION_PATTERNS) {
    if (lower.includes(pattern)) {
      return { ok: false, error: "Invalid input", status: 400 };
    }
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Rate limiter — in-memory sliding window
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Timestamps of recent AI requests per user UUID.
 * Module-level — survives across requests on the same Node process.
 * Resets on server restart; not shared across multiple instances.
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Sliding-window rate limiter: allows at most 10 AI requests per user per hour.
 * Records the request timestamp on approval; the caller must invoke this
 * before doing any AI work so the slot is consumed only when the check passes.
 */
export function checkRateLimit(userId: string): GuardrailResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Prune timestamps outside the current window
  const timestamps = (rateLimitStore.get(userId) ?? []).filter(
    (t) => t > windowStart,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(userId, timestamps);
    return {
      ok: false,
      error: "Rate limit exceeded — try again later",
      status: 429,
    };
  }

  timestamps.push(now);
  rateLimitStore.set(userId, timestamps);
  return { ok: true };
}
