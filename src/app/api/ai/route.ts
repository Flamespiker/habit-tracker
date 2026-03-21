import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/db/supabase/server'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import { getUserPreferences } from '@/lib/db/mongo/user-preferences'
import { saveCoachingResponse } from '@/lib/db/mongo/ai-coaching'
import { loadPrompt } from '@/lib/ai/prompts'

const anthropic = new Anthropic()

/**
 * POST /api/ai
 * Generates a daily coaching nudge for the authenticated user.
 * Body (all optional): { mood_score?: number; journal_entry?: string }
 *
 * Flow:
 *   1. Auth — 401 if no session
 *   2. Fetch today's habits + checkins (Supabase) + user preferences (MongoDB) in parallel
 *   3. Build variables and load the daily-coaching-nudge prompt
 *   4. Call Claude API
 *   5. Save response to MongoDB via saveCoachingResponse()
 *   6. Return { nudge: string }
 */
export async function POST(request: Request) {
  try {
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

    // Fetch habits, today's checkins, and user preferences in parallel
    const [habitRows, checkins, prefs] = await Promise.all([
      getHabits(user.id, supabase),
      getTodayCheckins(user.id, today, supabase),
      getUserPreferences(user.id),
    ])

    const habits = habitRows.map((row) => toHabit(row, checkins))
    const completedHabits = habits.filter((h) => h.completed_today).map((h) => h.name).join(', ') || 'none'
    const incompleteHabits = habits.filter((h) => !h.completed_today).map((h) => h.name).join(', ') || 'none'
    const coachingStyle = prefs?.coaching_style ?? 'motivational'

    // Load and interpolate the prompt YAML
    const prompt = await loadPrompt('daily-coaching-nudge', {
      date: today,
      coaching_style: coachingStyle,
      completed_habits: completedHabits,
      incomplete_habits: incompleteHabits,
      mood_score: moodScore,
      journal_entry: journalEntry,
    })

    // Call Claude — model comes from the prompt YAML (claude-sonnet-4-6)
    const message = await anthropic.messages.create({
      model: prompt.model,
      max_tokens: 256,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const nudge = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to MongoDB — replaces the placeholder written by the checkins route
    await saveCoachingResponse({
      user_id: user.id,
      type: 'daily_nudge',
      habit_context: {
        date: today,
        completed_habits: completedHabits,
        incomplete_habits: incompleteHabits,
        mood_score: moodScore,
        journal_entry: journalEntry,
      },
      content: nudge,
      model: prompt.model,
    })

    return NextResponse.json({ nudge })
  } catch (err) {
    console.error('[POST /api/ai]', err)
    const message = err instanceof Error ? err.message : 'Failed to generate coaching nudge'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
