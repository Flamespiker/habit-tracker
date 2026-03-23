import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WeeklyChartProps {
  /** Completion counts for Mon–Sun of the current week (7 values, index 0 = Monday). */
  data: number[];
  /** Index (0–6) of today's column so it can be highlighted. */
  todayIndex: number;
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Bar chart showing how many habits were completed on each day of the current Mon–Sun week.
 * Today's bar is highlighted in full primary color; other days are dimmed.
 * Heights are computed proportionally relative to the day with the most completions.
 */
export function WeeklyChart({ data, todayIndex }: WeeklyChartProps) {
  const maxValue = Math.max(...data, 1);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Weekly Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-end justify-between gap-2">
          {data.map((value, index) => {
            const isToday = index === todayIndex;
            return (
              <div
                key={days[index]}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    "w-full rounded-t transition-all",
                    isToday ? "bg-primary" : "bg-primary/40",
                  )}
                  style={{
                    height: `${Math.max((value / maxValue) * 80, 4)}px`,
                  }}
                />
                <span
                  className={cn(
                    "text-xs",
                    isToday
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {isToday ? "Today" : days[index]}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyChart;
