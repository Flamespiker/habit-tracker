// 'use client' required: manages habit state (useState) and derives stats/chart data (useMemo).
"use client"

import { useState, useMemo } from "react"
import { flushSync } from "react-dom"
import { Target, Flame, CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import { HabitCard } from "./habits/HabitCard"
import { CategoryFilter } from "./category-filter"
import { StatsCard } from "./stats-card"
import { WeeklyChart } from "./weekly-chart"
import { Button } from "@/components/ui/button"
import { Habit, Category } from "@/lib/types"
import { NewHabitDialog } from "./habits/NewHabitDialog"

interface HabitDashboardProps {
  initialHabits: Habit[]
}

/**
 * Main dashboard view showing habit stats, a filterable habit list, and a weekly activity chart.
 */
export function HabitDashboard({ initialHabits }: HabitDashboardProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [nudge, setNudge] = useState<string | null>(null)
  const [isLoadingNudge, setIsLoadingNudge] = useState(false)
  const [nudgeError, setNudgeError] = useState<string | null>(null)

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

  // todayIndex: 0=Mon … 6=Sun — which column in the chart is today
  const todayIndex = useMemo(() => {
    const utcDay = new Date().getUTCDay() // 0=Sun, 1=Mon … 6=Sat
    return utcDay === 0 ? 6 : utcDay - 1
  }, [])

  const weeklyData = useMemo(() => {
    const now = new Date()
    const utcDay = now.getUTCDay()
    const daysFromMonday = utcDay === 0 ? 6 : utcDay - 1

    // Mon–Sun date strings for the current UTC week
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setUTCDate(now.getUTCDate() - daysFromMonday + i)
      return d.toISOString().split('T')[0]
    })

    // Count completions per date; future dates stay 0
    const countsByDate: Record<string, number> = Object.fromEntries(
      weekDates.map((d) => [d, 0])
    )

    habits.forEach((habit) => {
      habit.weekly_data.forEach((val, idx) => {
        if (val <= 0) return
        // weekly_data[idx] = 1 if completed (6 - idx) days ago
        const d = new Date(now)
        d.setUTCDate(now.getUTCDate() - (6 - idx))
        const dateStr = d.toISOString().split('T')[0]
        if (dateStr in countsByDate) countsByDate[dateStr]++
      })
    })

    return weekDates.map((d) => countsByDate[d])
  }, [habits])

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

  const getNudge = async () => {
    setIsLoadingNudge(true)
    setNudgeError(null)
    setNudge(null)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? "Failed to generate nudge")
      }
      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        flushSync(() => setNudge(accumulated))
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }
    } catch (err) {
      setNudgeError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoadingNudge(false)
    }
  }

  return (
    <div className="bg-background">
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
                <NewHabitDialog onAdd={(habit) => setHabits((prev) => [...prev, habit])} />
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
            <WeeklyChart data={weeklyData} todayIndex={todayIndex} />

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Coaching Nudge
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getNudge}
                  disabled={isLoadingNudge}
                  className="h-7 text-xs"
                >
                  {isLoadingNudge ? (
                    <>
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    "Get nudge"
                  )}
                </Button>
              </div>
              {nudgeError && (
                <p className="text-xs text-destructive">{nudgeError}</p>
              )}
              {isLoadingNudge && !nudge && (
                <p className="text-sm text-muted-foreground">Generating your coaching nudge…</p>
              )}
              {nudge && (
                <p className="text-sm text-muted-foreground">{nudge}</p>
              )}
              {!nudge && !isLoadingNudge && !nudgeError && (
                <p className="text-sm text-muted-foreground">
                  Get a personalised nudge based on your habits.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HabitDashboard
