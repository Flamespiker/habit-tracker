import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

/**
 * Creates a Supabase client using the service role key.
 * Bypasses Row Level Security — use ONLY in server-side API routes.
 *
 * TODO (Week 6): remove all call sites and replace with the authenticated server client
 * once RLS policies and session-based auth are in place.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
