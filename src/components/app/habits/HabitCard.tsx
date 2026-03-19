// TODO: Display a single habit card with its category badge, name, streak, weekly progress bar, and a check-in toggle button.

// 'use client' required: check-in button uses onClick to call the onToggle callback.
"use client"

import Link from "next/link"
import { Check, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Habit, categoryColors, categoryLabels } from "@/lib/types"

interface HabitCardProps {
  habit: Habit
  onToggle: (id: string) => void
}

/**
 * Displays a single habit with its category, name, current streak, weekly progress,
 * and a button to toggle today's completion.
 */
export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const completedDays = habit.weekly_data.filter((v) => v > 0).length
  // Fall back to 7 when target_days is 0 or unset to avoid dividing by zero
  const target = habit.target_days || 7
  const progressPct = Math.min(Math.round((completedDays / target) * 100), 100)
  const colors = categoryColors[habit.category]

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge
              variant="outline"
              className={cn(colors.bg, colors.text, colors.border)}
            >
              {categoryLabels[habit.category]}
            </Badge>
            <Link
              href={`/habits/${habit.id}`}
              className="mt-2 block truncate text-sm font-medium text-foreground hover:underline"
            >
              {habit.name}
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>{habit.streak} day streak</span>
            </div>
          </div>

          <Button
            variant={habit.completed_today ? "default" : "outline"}
            size="icon"
            onClick={() => onToggle(habit.id)}
            aria-label={habit.completed_today ? "Mark incomplete" : "Mark complete"}
            className="mt-0.5 shrink-0"
          >
            <Check />
          </Button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>This week</span>
            <span>{completedDays}/{target} days</span>
          </div>
          <Progress value={progressPct} />
        </div>
      </CardContent>
    </Card>
  )
}

export default HabitCard
