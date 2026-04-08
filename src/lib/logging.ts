import { createHash } from "crypto";

/**
 * Returns an 8-character hex prefix of a SHA-256 hash of the given user ID.
 * Used to correlate log entries for a user without exposing their raw UUID.
 */
function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 8);
}

interface RequestLogParams {
  route: string;
  method: string;
  /** HTTP status code — include only in end-of-request logs. */
  status?: number;
  /** Response time in milliseconds — include only in end-of-request logs. */
  duration_ms?: number;
  /** Raw Supabase user UUID — automatically hashed before logging. */
  userId?: string;
  /** Error message if the request failed. */
  error?: string;
}

/**
 * Emits a structured JSON log line for an API request.
 *
 * Call once at the start of the handler (omit status/duration_ms) and again
 * at each return point (include status and duration_ms). The raw user UUID is
 * never logged — it is hashed via SHA-256 before emission.
 */
export function logRequest({
  route,
  method,
  status,
  duration_ms,
  userId,
  error,
}: RequestLogParams): void {
  const entry: Record<string, unknown> = { route, method };
  if (status !== undefined) entry.status = status;
  if (duration_ms !== undefined) entry.duration_ms = duration_ms;
  if (userId) entry.user_id = hashUserId(userId);
  if (error) entry.error = error;
  console.log(JSON.stringify(entry));
}
