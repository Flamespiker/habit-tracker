import { createClient } from './server'
import type { Goal } from '@/lib/types'

/** DB-level goal row — excludes UI-only `habit_ids` not stored in the `goals` table. */
export type GoalRow = Omit<Goal, 'habit_ids'>

type CreateGoalInput = Omit<GoalRow, 'id' | 'created_at'>
type UpdateGoalInput = Partial<Omit<GoalRow, 'id' | 'user_id' | 'created_at'>>

/**
 * Fetches all goals for a given user, ordered by creation date.
 * Returns DB rows — callers must merge `habit_ids` from the `goal_habits` join table.
 */
export async function getGoals(userId: string): Promise<GoalRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Inserts a new goal and returns the created row.
 */
export async function createGoal(goal: CreateGoalInput): Promise<GoalRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Updates fields on an existing goal and returns the updated row.
 */
export async function updateGoal(id: string, updates: UpdateGoalInput): Promise<GoalRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
