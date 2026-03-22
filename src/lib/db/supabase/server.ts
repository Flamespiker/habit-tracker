import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

// Cap all Supabase HTTP calls at 30s so Server Actions fail fast instead of
// hanging until the Playwright test timeout (120s) fires. Without this, a slow
// Supabase cold-start causes the signInWithPassword call to hang indefinitely
// and makes CI auth tests time out.
function fetchWithTimeout(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  )
}

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads and writes cookies via Next.js `cookies()`.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component — cookies are read-only.
            // Middleware handles session refresh in that case.
          }
        },
      },
      global: { fetch: fetchWithTimeout },
    }
  )
}
