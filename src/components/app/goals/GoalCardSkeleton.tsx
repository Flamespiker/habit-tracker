import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton that matches the shape of a goal row on the goals list page:
 * goal title, linked habits line, status badge, and target date.
 */
export function GoalCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Goal title */}
            <Skeleton className="h-4 w-2/3" />
            {/* Linked habits */}
            <Skeleton className="h-3 w-1/3" />
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {/* Status badge */}
            <Skeleton className="h-5 w-16 rounded-full" />
            {/* Target date */}
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GoalCardSkeleton;
