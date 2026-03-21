import { NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase/server'
import { runSupportAgent } from '@/lib/ai/support-agent'

/**
 * POST /api/support
 * Runs the LangGraph support agent for the authenticated user.
 * Body: { question: string }
 *
 * Returns 200 with { answer } on success.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if (!question) return NextResponse.json({ error: 'question is required' }, { status: 400 })

  try {
    const answer = await runSupportAgent(user.id, question)
    return NextResponse.json({ answer })
  } catch (err) {
    console.error('[POST /api/support]', err)
    const message = err instanceof Error ? err.message : 'Failed to answer question'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
