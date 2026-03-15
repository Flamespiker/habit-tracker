/** Available habit categories. */
export type Category = "health" | "fitness" | "mindfulness" | "productivity" | "learning"

/** Tailwind color classes for each habit category badge. */
export const categoryColors: Record<Category, { bg: string; text: string; border: string }> = {
  health: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  fitness: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  mindfulness: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  productivity: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  learning: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
}

/** Human-readable display labels for each habit category. */
export const categoryLabels: Record<Category, string> = {
  health: "Health",
  fitness: "Fitness",
  mindfulness: "Mindfulness",
  productivity: "Productivity",
  learning: "Learning",
}

/** Goal status values matching the `goals.status` column. */
export type GoalStatus = "active" | "completed" | "abandoned"

/** A user goal. Mirrors the `goals` table in Supabase. */
export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  status: GoalStatus
  created_at: string
  /** UI-only — not stored in the DB. Derived from the `goal_habits` join table. */
  habit_ids: string[]
}

/** A tracked habit. Mirrors the `habits` table in Supabase. */
export interface Habit {
  id: string
  user_id: string
  name: string
  frequency: "daily" | "weekly" | "custom"
  category: Category
  /** Target number of days to complete this habit per frequency period. */
  target_days: number
  streak: number
  /** UI-only — not stored in the DB. Derived from today's row in the `checkins` table. */
  completed_today: boolean
  /** UI-only — not stored in the DB. Derived from the last 7 rows in the `checkins` table. */
  weekly_data: number[]
  created_at: string
}
