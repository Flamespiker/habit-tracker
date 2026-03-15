// TODO: Stage 3 — replace mockHabits with GET /api/log, and wire the submit button to
// POST /api/log (habits + notes), then trigger POST /api/ai for a coaching insight.

// 'use client' required: manages habit check-in toggle state and journal notes field.
"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { mockHabits } from "@/lib/mock-data"
import { Habit, categoryColors, categoryLabels } from "@/lib/types"

// Native <textarea> styled to match the shadcn Input component.
const textareaClassName = cn(
  "min-h-[100px] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
  "placeholder:text-muted-foreground",
  "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
)

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Daily log page. Shows today's habits as a check-in list and a notes field.
 * Client Component — manages toggle state and notes until API routes are wired up in Stage 3.
 */
export default function LogPage() {
  const [habits, setHabits] = useState<Habit[]>(mockHabits)
  const [notes, setNotes] = useState("")

  const completedCount = habits.filter((h) => h.completed_today).length

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, completed_today: !h.completed_today } : h
      )
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Daily Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">{formatToday()}</p>
      </div>

      {/* Habit checklist */}
      <Card className="mb-6 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-baseline gap-2 text-sm font-medium text-foreground">
            Today&apos;s Habits
            <span className="text-xs font-normal text-muted-foreground">
              {completedCount} of {habits.length} done
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {habits.map((habit) => {
            const colors = categoryColors[habit.category]
            return (
              <div key={habit.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(colors.bg, colors.text, colors.border, "shrink-0")}
                  >
                    {categoryLabels[habit.category]}
                  </Badge>
                  <span
                    className={cn(
                      "truncate text-sm transition-colors",
                      habit.completed_today
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {habit.name}
                  </span>
                </div>
                <Button
                  variant={habit.completed_today ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleHabit(habit.id)}
                  aria-label={habit.completed_today ? "Mark incomplete" : "Mark complete"}
                  className="shrink-0"
                >
                  <Check />
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-6 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="log-notes" className="sr-only">
            Journal notes
          </Label>
          <textarea
            id="log-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did today go? Any wins, blockers, or reflections..."
            className={textareaClassName}
          />
        </CardContent>
      </Card>

      {/* Submit — disabled until Stage 3 */}
      <Button className="w-full" disabled>
        Log Day
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Saving will be enabled once the backend is connected.
      </p>
    </main>
  )
}
