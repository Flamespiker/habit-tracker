import { Goal, Habit } from "./types"

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"

/**
 * Mock habits for Stage 2 (UI with mock data).
 * Replace with GET /api/habits once the Supabase layer is wired up.
 */
export const mockHabits: Habit[] = [
  {
    id: "1",
    user_id: MOCK_USER_ID,
    name: "Morning Run",
    frequency: "daily",
    category: "fitness",
    target_days: 7,
    streak: 5,
    completed_today: true,
    weekly_data: [1, 1, 1, 0, 1, 1, 0],
    created_at: "2026-01-06T07:00:00Z",
  },
  {
    id: "2",
    user_id: MOCK_USER_ID,
    name: "Drink 8 Glasses of Water",
    frequency: "daily",
    category: "health",
    target_days: 7,
    streak: 3,
    completed_today: false,
    weekly_data: [1, 0, 1, 1, 0, 1, 1],
    created_at: "2026-01-06T07:00:00Z",
  },
  {
    id: "3",
    user_id: MOCK_USER_ID,
    name: "Meditate 10 Minutes",
    frequency: "daily",
    category: "mindfulness",
    target_days: 7,
    streak: 7,
    completed_today: false,
    weekly_data: [1, 1, 0, 1, 1, 1, 1],
    created_at: "2026-01-20T07:00:00Z",
  },
  {
    id: "4",
    user_id: MOCK_USER_ID,
    name: "Read 30 Minutes",
    frequency: "custom",
    category: "learning",
    target_days: 5,
    streak: 14,
    completed_today: true,
    weekly_data: [1, 1, 1, 1, 0, 1, 1],
    created_at: "2025-12-01T07:00:00Z",
  },
  {
    id: "5",
    user_id: MOCK_USER_ID,
    name: "Deep Work Session",
    frequency: "custom",
    category: "productivity",
    target_days: 5,
    streak: 2,
    completed_today: false,
    weekly_data: [0, 1, 1, 0, 1, 0, 0],
    created_at: "2026-02-03T07:00:00Z",
  },
]

/**
 * Mock goals for Stage 2 (UI with mock data).
 * Replace with GET /api/goals once the Supabase layer is wired up.
 */
export const mockGoals: Goal[] = [
  {
    id: "g1",
    user_id: MOCK_USER_ID,
    title: "Run a 5K",
    description: "Complete a 5K run without stopping.",
    target_date: "2026-06-01",
    status: "active",
    created_at: "2026-01-06T07:00:00Z",
    habit_ids: ["1"], // Morning Run
  },
  {
    id: "g2",
    user_id: MOCK_USER_ID,
    title: "Build a mindfulness practice",
    description: "Meditate every day for 30 consecutive days.",
    target_date: "2026-04-30",
    status: "active",
    created_at: "2026-01-20T07:00:00Z",
    habit_ids: ["3"], // Meditate 10 Minutes
  },
  {
    id: "g3",
    user_id: MOCK_USER_ID,
    title: "Read 12 books this year",
    description: "Finish one book per month by reading at least 30 minutes daily.",
    target_date: "2026-12-31",
    status: "active",
    created_at: "2025-12-01T07:00:00Z",
    habit_ids: ["4"], // Read 30 Minutes
  },
  {
    id: "g4",
    user_id: MOCK_USER_ID,
    title: "Improve overall wellbeing",
    description: null,
    target_date: null,
    status: "active",
    created_at: "2026-02-03T07:00:00Z",
    habit_ids: [], // standalone — no linked habits yet
  },
]
