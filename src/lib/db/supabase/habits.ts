import { createClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types'
import type { Habit, Category } from '@/lib/types'
import type { Database } from '@/lib/types/database.types'

type Client = SupabaseClient<Database>

/** DB-level habit row — matches the `habits` table exactly. */
export type HabitRow = Tables<'habits'>

type CreateHabitInput = TablesInsert<'habits'>
type UpdateHabitInput = Omit<TablesUpdate<'habits'>, 'id' | 'user_id' | 'created_at'>

/**
 * Minimal checkin shape needed by toHabit — avoids importing the full Checkin type.
 * `date` must be a UTC ISO date string (YYYY-MM-DD).
 */
type CheckinRecord = { habit_id: string; date: string; completed: boolean }

/**
 * Maps a DB habit row to the app-level Habit type.
 * Pass `checkins` (all checkins for the user over the relevant period) to derive
 * `completed_today`, `streak`, and `weekly_data`. Defaults to [] when omitted.
 *
 * Dates are computed and stored in UTC. TODO: weekly_data dates should be formatted
 * to the user's local timezone when displayed on the client.
 */
export function toHabit(row: HabitRow, checkins: CheckinRecord[] = []): Habit {
  // Filter to this habit and build a set of completed UTC date strings for O(1) lookup
  const completedDates = new Set(
    checkins
      .filter((c) => c.habit_id === row.id && c.completed)
      .map((c) => c.date)
  )

  const today = new Date().toISOString().split('T')[0]
  const completed_today = completedDates.has(today)

  // weekly_data: index 0 = 6 days ago, index 6 = today — 1 if completed, 0 if not
  const weekly_data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - (6 - i))
    return completedDates.has(d.toISOString().split('T')[0]) ? 1 : 0
  })

  // streak: consecutive completed days counting back from today.
  // If today is incomplete the streak starts from yesterday — today hasn't ended yet.
  let streak = 0
  const startOffset = completed_today ? 0 : 1
  for (let i = startOffset; ; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    if (!completedDates.has(d.toISOString().split('T')[0])) break
    streak++
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    frequency: row.frequency as Habit['frequency'],
    category: row.category as Category,
    // DB stores target_days as an array of day-of-week indices; app type uses the count.
    target_days: row.target_days.length,
    streak,
    completed_today,
    weekly_data,
    created_at: row.created_at,
  }
}

/**
 * Fetches all habits for a given user, ordered by creation date.
 * Returns DB rows — callers must derive `completed_today` and `weekly_data` from checkins.
 * Pass `client` to override the default server client (e.g. the admin client in Server Components).
 */
export async function getHabits(userId: string, client?: Client): Promise<HabitRow[]> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Fetches a single habit by ID, scoped to the given user.
 * Returns null if no matching row exists or the habit belongs to a different user.
 */
export async function getHabitById(userId: string, habitId: string, client?: Client): Promise<HabitRow | null> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows found
    throw error
  }
  return data
}

/**
 * Inserts a new habit and returns the created row.
 * Pass `client` to override the default server client (e.g. the admin client in API routes).
 */
export async function createHabit(habit: CreateHabitInput, client?: Client): Promise<HabitRow> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Updates fields on an existing habit and returns the updated row.
 */
export async function updateHabit(id: string, updates: UpdateHabitInput): Promise<HabitRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Deletes a habit by ID.
 */
export async function deleteHabit(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)

  if (error) throw error
}
