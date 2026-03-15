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

/** A tracked habit with progress, streak, and weekly activity data. */
export interface Habit {
  id: string
  name: string
  category: Category
  /** Daily target count (e.g. 8 glasses of water). */
  target: number
  /** Units completed today. */
  completed: number
  completedToday: boolean
  streak: number
  bestStreak: number
  /** Completion counts for the last 7 days (Mon–Sun). */
  weeklyData: number[]
}
