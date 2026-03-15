import { Habit } from "./types"

/**
 * Seed/mock habits for development and initial client state.
 * Replace with API fetching once the Supabase data layer is wired up.
 */
export const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Morning Run",
    category: "fitness",
    target: 1,
    completed: 1,
    completedToday: true,
    streak: 5,
    bestStreak: 12,
    weeklyData: [1, 1, 1, 0, 1, 1, 0],
  },
  {
    id: "2",
    name: "Drink 8 Glasses of Water",
    category: "health",
    target: 8,
    completed: 0,
    completedToday: false,
    streak: 3,
    bestStreak: 8,
    weeklyData: [1, 0, 1, 1, 0, 1, 1],
  },
  {
    id: "3",
    name: "Meditate 10 Minutes",
    category: "mindfulness",
    target: 1,
    completed: 0,
    completedToday: false,
    streak: 7,
    bestStreak: 21,
    weeklyData: [1, 1, 0, 1, 1, 1, 1],
  },
  {
    id: "4",
    name: "Read 30 Minutes",
    category: "learning",
    target: 1,
    completed: 1,
    completedToday: true,
    streak: 14,
    bestStreak: 30,
    weeklyData: [1, 1, 1, 1, 0, 1, 1],
  },
  {
    id: "5",
    name: "Deep Work Session",
    category: "productivity",
    target: 1,
    completed: 0,
    completedToday: false,
    streak: 2,
    bestStreak: 10,
    weeklyData: [0, 1, 1, 0, 1, 0, 0],
  },
]
