import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton that matches the shape of HabitCard:
 * category badge, habit name, streak row, check-in button, and weekly progress bar.
 */
export function HabitCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Category badge */}
            <Skeleton className="h-5 w-16 rounded-full" />
            {/* Habit name */}
            <Skeleton className="h-4 w-3/4" />
            {/* Streak row */}
            <Skeleton className="h-3 w-24" />
          </div>
          {/* Check-in button */}
          <Skeleton className="mt-0.5 h-9 w-9 shrink-0 rounded-md" />
        </div>

        <div className="mt-4 space-y-1.5">
          {/* "This week" / "x/y days" labels */}
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          {/* Progress bar */}
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default HabitCardSkeleton;
