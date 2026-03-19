import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/supabase/admin'
import { connectToMongoDB } from '@/lib/db/mongo/client'

type ServiceResult = { status: 'ok' } | { status: 'error'; error: string }

/**
 * GET /api/health
 * Checks connectivity to Supabase and MongoDB.
 * Returns 200 if all systems are healthy, 503 if any check fails.
 */
export async function GET() {
  let supabase: ServiceResult = { status: 'error', error: 'unknown' }
  let mongodb: ServiceResult = { status: 'error', error: 'unknown' }

  await Promise.all([
    (async () => {
      try {
        const client = createAdminClient()
        const { error } = await client.from('habits').select('id').limit(1)
        if (error) {
          supabase = { status: 'error', error: error.message }
        } else {
          supabase = { status: 'ok' }
        }
      } catch (err) {
        supabase = { status: 'error', error: err instanceof Error ? err.message : String(err) }
      }
    })(),
    (async () => {
      try {
        await connectToMongoDB()
        mongodb = { status: 'ok' }
      } catch (err) {
        mongodb = { status: 'error', error: err instanceof Error ? err.message : String(err) }
      }
    })(),
  ])

  const allOk = supabase.status === 'ok' && mongodb.status === 'ok'

  return NextResponse.json(
    { supabase, mongodb, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
