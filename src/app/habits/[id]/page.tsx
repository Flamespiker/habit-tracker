import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/db/supabase/server"
import { getHabitById, toHabit } from "@/lib/db/supabase/habits"
import { getCheckins } from "@/lib/db/supabase/checkins"
import { categoryColors, categoryLabels } from "@/lib/types"

interface HabitDetailPageProps {
  params: Promise<{ id: string }>
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const frequencyLabels: Record<"daily" | "weekly" | "custom", string> = {
  daily: "Daily",
  weekly: "Weekly",
  custom: "Custom",
}

/**
 * Detail page for a single habit.
 * Displays habit metadata, streak, and a weekly completion grid.
 * Server Component — fetches real data from Supabase.
 */
export default async function HabitDetailPage({ params }: HabitDetailPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayDate = new Date()
  const today = todayDate.toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(todayDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [habitRow, checkins] = await Promise.all([
    getHabitById(user.id, id, supabase),
    getCheckins(id, thirtyDaysAgo, today, supabase),
  ])

  if (!habitRow) notFound()

  const habit = toHabit(habitRow, checkins)

  const colors = categoryColors[habit.category]
  const completedCount = habit.weekly_data.filter((v) => v > 0).length

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">

      <Button variant="ghost" size="sm" className="-ml-2 mb-6" asChild>
        <Link href="/habits">
          <ArrowLeft />
          Back to Habits
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <Badge variant="outline" className={cn(colors.bg, colors.text, colors.border, "mb-3")}>
          {categoryLabels[habit.category]}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {habit.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center p-4">
            <div className="flex items-center gap-1 text-2xl font-semibold text-foreground">
              <Flame className="h-5 w-5 text-orange-500" />
              {habit.streak}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">day streak</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center p-4">
            <p className="text-2xl font-semibold text-foreground">
              {frequencyLabels[habit.frequency]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">frequency</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center p-4">
            <p className="text-2xl font-semibold text-foreground">{habit.target_days}</p>
            <p className="mt-1 text-xs text-muted-foreground">target days / wk</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly completion grid */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-baseline gap-2 text-sm font-medium text-foreground">
            This Week
            <span className="text-xs font-normal text-muted-foreground">
              {completedCount} / {habit.target_days} days
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const completed = habit.weekly_data[i] > 0
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-colors",
                      completed
                        ? "border-primary bg-primary"
                        : "border-border bg-transparent"
                    )}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

    </main>
  )
}
