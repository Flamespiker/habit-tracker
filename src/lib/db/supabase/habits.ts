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

/** Minimal checkin shape needed by toHabit — avoids importing from checkins.ts. */
type TodayCheckin = { habit_id: string; completed: boolean }

/**
 * Maps a DB habit row to the app-level Habit type.
 * Pass `todayCheckins` (all checkins for the user today) to populate `completed_today`.
 * `streak` and `weekly_data` remain stubbed — TODO (Week 6): derive from checkins.
 */
export function toHabit(row: HabitRow, todayCheckins?: TodayCheckin[]): Habit {
  const completed_today =
    todayCheckins?.some((c) => c.habit_id === row.id && c.completed) ?? false

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    frequency: row.frequency as Habit['frequency'],
    category: row.category as Category,
    // DB stores target_days as an array of day-of-week indices; app type uses the count.
    target_days: row.target_days.length,
    streak: 0,
    completed_today,
    weekly_data: [0, 0, 0, 0, 0, 0, 0],
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
