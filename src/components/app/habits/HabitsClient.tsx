// 'use client' required: manages habit toggle state (useState) for the HabitCard check-in buttons.
"use client"

import { useState } from "react"
import { Habit } from "@/lib/types"
import { HabitCard } from "./HabitCard"
import { NewHabitDialog } from "./NewHabitDialog"

interface HabitsClientProps {
  initialHabits: Habit[]
}

/**
 * Client-side habits list. Manages toggle state for check-in buttons.
 * Receives server-fetched habits as initial state via props.
 */
export function HabitsClient({ initialHabits }: HabitsClientProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)

  const completedToday = habits.filter((h) => h.completed_today).length

  const toggleHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id)
    if (!habit) return
    const newCompleted = !habit.completed_today

    // Optimistic update — UI responds immediately
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, completed_today: newCompleted, streak: newCompleted ? h.streak + 1 : h.streak - 1 }
          : h
      )
    )

    // Persist to Supabase
    const today = new Date().toISOString().split('T')[0]
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: id, date: today, completed: newCompleted }),
      })
    } catch (err) {
      console.error('[toggleHabit]', err)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Habits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedToday} of {habits.length} completed today
          </p>
        </div>
        <NewHabitDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))}
      </div>
    </main>
  )
}

export default HabitsClient
