import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/db/supabase/server'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import { getUserPreferences } from '@/lib/db/mongo/user-preferences'
import { saveCoachingResponse } from '@/lib/db/mongo/ai-coaching'
import { loadPrompt } from '@/lib/ai/prompts'
import { NextResponse } from 'next/server'

/**
 * POST /api/ai
 * Streams a daily coaching nudge for the authenticated user.
 * Body (all optional): { mood_score?: number; journal_entry?: string }
 *
 * Flow:
 *   1. Auth — 401 if no session
 *   2. Fetch today's habits + checkins (Supabase) + user preferences (MongoDB) in parallel
 *   3. Build variables and load the daily-coaching-nudge prompt
 *   4. Stream via Vercel AI SDK streamText + @ai-sdk/anthropic
 *   5. onFinish: save completed nudge to MongoDB
 *   6. Return text/plain streaming response
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Optional body params — gracefully handle missing or malformed body
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const moodScore = typeof body.mood_score === 'number' ? String(body.mood_score) : 'not provided'
  const journalEntry = typeof body.journal_entry === 'string' && body.journal_entry.trim()
    ? body.journal_entry.trim()
    : 'none'

  const today = new Date().toISOString().split('T')[0]

  let completedHabits = 'none'
  let incompleteHabits = 'none'
  let coachingStyle = 'motivational'
  let modelName = 'claude-sonnet-4-6'

  try {
    // Fetch habits, today's checkins, and user preferences in parallel
    const [habitRows, checkins, prefs] = await Promise.all([
      getHabits(user.id, supabase),
      getTodayCheckins(user.id, today, supabase),
      getUserPreferences(user.id),
    ])

    const habits = habitRows.map((row) => toHabit(row, checkins))
    completedHabits = habits.filter((h) => h.completed_today).map((h) => h.name).join(', ') || 'none'
    incompleteHabits = habits.filter((h) => !h.completed_today).map((h) => h.name).join(', ') || 'none'
    coachingStyle = prefs?.coaching_style ?? 'motivational'

    // Load and interpolate the prompt YAML
    const prompt = await loadPrompt('daily-coaching-nudge', {
      date: today,
      coaching_style: coachingStyle,
      completed_habits: completedHabits,
      incomplete_habits: incompleteHabits,
      mood_score: moodScore,
      journal_entry: journalEntry,
    })

    modelName = prompt.model

    const userId = user.id
    const habitContext = {
      date: today,
      completed_habits: completedHabits,
      incomplete_habits: incompleteHabits,
      mood_score: moodScore,
      journal_entry: journalEntry,
    }

    // Stream via Vercel AI SDK — saves to MongoDB once complete
    const result = streamText({
      model: anthropic(prompt.model),
      system: prompt.system,
      prompt: prompt.user,
      maxOutputTokens: 256,
      onFinish: ({ text }) => {
        saveCoachingResponse({
          user_id: userId,
          type: 'daily_nudge',
          habit_context: habitContext,
          content: text,
          model: modelName,
        }).catch((err) => console.error('[POST /api/ai] MongoDB save failed:', err))
      },
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[POST /api/ai]', err)
    const message = err instanceof Error ? err.message : 'Failed to generate coaching nudge'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
