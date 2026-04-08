import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/db/supabase/server";
import { getGoalById, getGoalHabitIds } from "@/lib/db/supabase/goals";
import { getHabits, toHabit } from "@/lib/db/supabase/habits";
import { getCheckinsForPeriod } from "@/lib/db/supabase/checkins";
import { GoalStatus, categoryColors, categoryLabels } from "@/lib/types";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusStyles: Record<GoalStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  abandoned: {
    label: "Abandoned",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No target date";
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Detail page for a single goal.
 * Fetches the goal, its linked habit IDs, and those habits with recent checkins from Supabase.
 */
export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const goalRow = await getGoalById(user.id, id, supabase);
  if (!goalRow) notFound();

  const habitIds = await getGoalHabitIds(id, supabase);

  // Only fetch habits and checkins if there are linked habits
  const linkedHabits =
    habitIds.length > 0
      ? await (async () => {
          const [habitRows, checkins] = await Promise.all([
            getHabits(user.id, supabase),
            getCheckinsForPeriod(user.id, sevenDaysAgo, today, supabase),
          ]);
          const habits = habitRows.map((row) => toHabit(row, checkins));
          return habitIds
            .map((hid) => habits.find((h) => h.id === hid))
            .filter((h): h is NonNullable<typeof h> => h !== undefined);
        })()
      : [];

  const style = statusStyles[goalRow.status as GoalStatus];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" className="-ml-2 mb-6" asChild>
        <Link href="/goals">
          <ArrowLeft />
          Back to Goals
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <Badge variant="outline" className={cn(style.className, "mb-3")}>
          {style.label}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {goalRow.title}
        </h1>
      </div>

      {/* Target date */}
      <Card className="mb-6 border-border bg-card">
        <CardContent className="flex items-center gap-3 p-4">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Target date</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(goalRow.target_date)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Linked habits */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Linked Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedHabits.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {linkedHabits.map((habit) => {
                const colors = categoryColors[habit.category];
                return (
                  <li
                    key={habit.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(colors.bg, colors.text, colors.border)}
                      >
                        {categoryLabels[habit.category]}
                      </Badge>
                      <Link
                        href={`/habits/${habit.id}`}
                        className="truncate text-sm text-foreground hover:underline"
                      >
                        {habit.name}
                      </Link>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {habit.streak}d streak
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/50">No linked habits</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
