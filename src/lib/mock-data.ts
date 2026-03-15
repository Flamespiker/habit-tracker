import { Habit } from "./types"

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
