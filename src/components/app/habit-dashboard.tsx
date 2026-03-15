// 'use client' required: manages habit state (useState) and derives stats/chart data (useMemo).
// TODO: Replace initialHabits with a fetch to /api/habits once the Supabase layer is wired up.
"use client"

import { useState, useMemo } from "react"
import { Target, Flame, CheckCircle2 } from "lucide-react"
import { HabitCard } from "./habits/HabitCard"
import { CategoryFilter } from "./category-filter"
import { StatsCard } from "./stats-card"
import { WeeklyChart } from "./weekly-chart"
import { Habit, Category } from "@/lib/types"
import { mockHabits } from "@/lib/mock-data"
import { NewHabitDialog } from "./habits/NewHabitDialog"

/**
 * Main dashboard view showing habit stats, a filterable habit list, and a weekly activity chart.
 */
export function HabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>(mockHabits)
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")

  const filteredHabits = useMemo(() => {
    if (selectedCategory === "all") return habits
    return habits.filter((habit) => habit.category === selectedCategory)
  }, [habits, selectedCategory])

  const stats = useMemo(() => {
    const totalHabits = habits.length
    const completedToday = habits.filter((h) => h.completed_today).length
    const completionRate = Math.round((completedToday / totalHabits) * 100)
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0)
    return { totalHabits, completedToday, completionRate, totalStreak }
  }, [habits])

  const weeklyData = useMemo(() => {
    const data = [0, 0, 0, 0, 0, 0, 0]
    habits.forEach((habit) => {
      habit.weekly_data.forEach((val, idx) => {
        if (val > 0) data[idx]++
      })
    })
    return data
  }, [habits])

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completed_today: !habit.completed_today,
              streak: !habit.completed_today ? habit.streak + 1 : habit.streak - 1,
            }
          : habit
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Habit Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build better habits, one day at a time
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Habits" value={stats.totalHabits} icon={Target} />
          <StatsCard
            title="Completed Today"
            value={`${stats.completedToday}/${stats.totalHabits}`}
            subtitle={`${stats.completionRate}% completion`}
            icon={CheckCircle2}
          />
          <StatsCard title="Total Streak Days" value={stats.totalStreak} icon={Flame} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-foreground">Your Habits</h2>
                <NewHabitDialog />
              </div>
              <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleHabit}
                />
              ))}
            </div>

            {filteredHabits.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-sm text-muted-foreground">No habits in this category</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <WeeklyChart data={weeklyData} />

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium text-foreground">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Start with small, achievable goals
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Stack new habits with existing ones
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Track your progress consistently
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Celebrate small wins along the way
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HabitDashboard
