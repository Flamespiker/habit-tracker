// TODO: Replace mockGoals/mockHabits with direct src/lib/db/supabase/ calls once Stage 3 is built.

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { mockGoals, mockHabits } from "@/lib/mock-data"
import { GoalStatus } from "@/lib/types"
import { NewGoalDialog } from "@/components/app/goals/NewGoalDialog"

const statusStyles: Record<GoalStatus, { label: string; className: string }> = {
  active:    { label: "Active",    className: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  abandoned: { label: "Abandoned", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No target date"
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Goals list page. Displays all goals with their status, target date, and linked habit names.
 * Server Component — reads directly from mock data (will read from lib/db/supabase/ in Stage 3).
 */
export default function GoalsPage() {
  const habitMap = Object.fromEntries(mockHabits.map((h) => [h.id, h.name]))

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track what you&apos;re working towards</p>
        </div>
        <NewGoalDialog habits={mockHabits} />
      </div>

      <div className="flex flex-col gap-3">
        {mockGoals.map((goal) => {
          const style = statusStyles[goal.status]
          const linkedHabits = goal.habit_ids
            .map((id) => habitMap[id])
            .filter(Boolean)

          return (
            <Card key={goal.id} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="truncate font-medium text-foreground hover:underline"
                    >
                      {goal.title}
                    </Link>
                    {linkedHabits.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {linkedHabits.join(" · ")}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground/50">No linked habits</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant="outline" className={cn(style.className)}>
                      {style.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(goal.target_date)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
