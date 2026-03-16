import { createClient } from './server'
import type { Habit } from '@/lib/types'

/** DB-level habit row — excludes UI-only fields not stored in the `habits` table. */
export type HabitRow = Omit<Habit, 'completed_today' | 'weekly_data'>

type CreateHabitInput = Omit<HabitRow, 'id' | 'created_at'>
type UpdateHabitInput = Partial<Omit<HabitRow, 'id' | 'user_id' | 'created_at'>>

/**
 * Fetches all habits for a given user, ordered by creation date.
 * Returns DB rows — callers must merge `completed_today` and `weekly_data` from checkins.
 */
export async function getHabits(userId: string): Promise<HabitRow[]> {
  const supabase = await createClient()
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
 */
export async function createHabit(habit: CreateHabitInput): Promise<HabitRow> {
  const supabase = await createClient()
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
