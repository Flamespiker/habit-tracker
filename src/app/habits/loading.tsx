import { Skeleton } from "@/components/ui/skeleton";
import { HabitCardSkeleton } from "@/components/app/habits/HabitCardSkeleton";

/**
 * Habits page loading state. Mirrors the layout of HabitsPage:
 * page header with count and New Habit button placeholder, then a grid of habit card skeletons.
 */
export default function HabitsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-40" />
        </div>
        {/* New Habit button placeholder */}
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <HabitCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
