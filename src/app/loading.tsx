import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitCardSkeleton } from "@/components/app/habits/HabitCardSkeleton";

/** Skeleton placeholder for a single StatsCard (icon + label + value). */
function StatsCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard loading state. Mirrors the layout of HabitDashboard:
 * page header, stats row, habit card grid, and weekly chart column.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Page header */}
        <header className="mb-8 space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </header>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Habit list — left 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* "Your Habits" heading row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            {/* 2-col habit card grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <HabitCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Right column: chart + tips */}
          <div className="space-y-6">
            {/* Weekly chart card */}
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="flex items-end gap-1.5 h-24">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ height: `${40 + (i % 3) * 20}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick tips card */}
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
