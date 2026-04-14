import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

/**
 * Creates a Supabase client using the service role key.
 * Bypasses Row Level Security — intentionally used by server-side agents
 * (weekly-summary-agent, support-agent) and /api/health that run without
 * a user session cookie. Do NOT use in regular API routes or pages — those
 * must use the authenticated server client from server.ts.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
