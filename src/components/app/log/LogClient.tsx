// 'use client' required: manages habit toggle state, journal notes, and streaming nudge fetch.
"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Check, Loader2, Sparkles, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Habit, categoryColors, categoryLabels } from "@/lib/types";
import type { IAiCoaching } from "@/lib/db/mongo/models/AiCoaching";

// Native <textarea> styled to match the shadcn Input component.
const textareaClassName = cn(
  "min-h-[100px] w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
  "placeholder:text-muted-foreground",
  "focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Type guard for the structured WeeklySummaryContent shape. */
interface WeeklySummaryContent {
  overview: string;
  highlights: string[];
  struggles: string[];
  recommendation: string;
}

function isWeeklySummaryContent(v: unknown): v is WeeklySummaryContent {
  return (
    typeof v === "object" &&
    v !== null &&
    "overview" in v &&
    "highlights" in v &&
    "struggles" in v &&
    "recommendation" in v
  );
}

interface Props {
  initialHabits: Habit[];
}

/**
 * Daily log client. Receives real habits from the Server Component wrapper.
 * Manages check-in toggle state, journal notes, streaming coaching nudge,
 * and weekly summary generation.
 */
export default function LogClient({ initialHabits }: Props) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [notes, setNotes] = useState("");
  const [latestNudge, setLatestNudge] = useState<IAiCoaching | null>(null);
  const [freshNudge, setFreshNudge] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const refreshCoachingHistory = useCallback(() => {
    fetch("/api/coaching?limit=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: IAiCoaching[] | null) => {
        if (Array.isArray(data) && data.length > 0) setLatestNudge(data[0]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshCoachingHistory();
  }, [refreshCoachingHistory]);

  const completedCount = habits.filter((h) => h.completed_today).length;

  const toggleHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const newCompleted = !habit.completed_today;

    // Optimistic update — UI responds immediately
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, completed_today: newCompleted } : h,
      ),
    );

    // Persist to Supabase
    const today = new Date().toISOString().split("T")[0];
    try {
      await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: id,
          date: today,
          completed: newCompleted,
        }),
      });
    } catch (err) {
      console.error("[toggleHabit]", err);
    }
  };

  const logDay = async () => {
    setIsLogging(true);
    setLogError(null);
    setFreshNudge(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal_entry: notes }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate nudge");
      }
      if (!res.body) throw new Error("No response body");

      // Consume the text/plain stream chunk by chunk
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        flushSync(() => setFreshNudge(accumulated));
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
      }
    } catch (err) {
      setLogError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLogging(false);
    }
  };

  const generateWeeklySummary = async () => {
    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/weekly-summary", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate weekly summary");
      }
      // Clear the streaming nudge and pull the new summary into the coaching card
      setFreshNudge(null);
      refreshCoachingHistory();
    } catch (err) {
      setSummaryError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const isAnyLoading = isLogging || isGeneratingSummary;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Daily Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{formatToday()}</p>
      </div>

      {/* Coaching card — loading, fresh stream, or latest historical entry */}
      {(isAnyLoading || freshNudge || latestNudge) && (
        <Card className="mb-6 border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              {isAnyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
              {latestNudge?.type === "weekly_summary" &&
              !isAnyLoading &&
              !freshNudge
                ? "Weekly Summary"
                : "Coach\u2019s Note"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGeneratingSummary ? (
              <p className="text-sm text-muted-foreground">
                Generating your weekly summary… this may take a moment.
              </p>
            ) : isLogging ? (
              <p className="text-sm text-muted-foreground">
                Generating your coaching nudge…
              </p>
            ) : freshNudge ? (
              <p className="text-sm text-muted-foreground">{freshNudge}</p>
            ) : latestNudge ? (
              isWeeklySummaryContent(latestNudge.content) ? (
                <WeeklySummaryView content={latestNudge.content} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {typeof latestNudge.content === "string"
                    ? latestNudge.content
                    : JSON.stringify(latestNudge.content)}
                </p>
              )
            ) : null}
          </CardContent>
        </Card>
      )}

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
            const colors = categoryColors[habit.category];
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      colors.bg,
                      colors.text,
                      colors.border,
                      "shrink-0",
                    )}
                  >
                    {categoryLabels[habit.category]}
                  </Badge>
                  <span
                    className={cn(
                      "truncate text-sm transition-colors",
                      habit.completed_today
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {habit.name}
                  </span>
                </div>
                <Button
                  variant={habit.completed_today ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleHabit(habit.id)}
                  aria-label={
                    habit.completed_today ? "Mark incomplete" : "Mark complete"
                  }
                  className="shrink-0"
                >
                  <Check />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-6 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Notes
          </CardTitle>
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

      <div className="flex flex-col gap-3">
        <Button className="w-full" onClick={logDay} disabled={isAnyLoading}>
          {isLogging ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating nudge…
            </>
          ) : (
            "Log Day"
          )}
        </Button>
        {logError && (
          <p className="text-center text-xs text-destructive">{logError}</p>
        )}

        <Button
          className="w-full"
          variant="outline"
          onClick={generateWeeklySummary}
          disabled={isAnyLoading}
        >
          {isGeneratingSummary ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating summary…
            </>
          ) : (
            <>
              <BarChart2 className="mr-2 h-4 w-4" />
              Generate weekly summary
            </>
          )}
        </Button>
        {summaryError && (
          <p className="text-center text-xs text-destructive">{summaryError}</p>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Weekly summary sub-component
// ---------------------------------------------------------------------------

/**
 * Renders a structured WeeklySummaryContent with labelled sections.
 */
function WeeklySummaryView({ content }: { content: WeeklySummaryContent }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">{content.overview}</p>

      {content.highlights.length > 0 && (
        <div>
          <p className="mb-1 font-medium text-foreground">Highlights</p>
          <ul className="space-y-1">
            {content.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.struggles.length > 0 && (
        <div>
          <p className="mb-1 font-medium text-foreground">Struggles</p>
          <ul className="space-y-1">
            {content.struggles.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-1 font-medium text-foreground">Focus for next week</p>
        <p className="text-muted-foreground">{content.recommendation}</p>
      </div>
    </div>
  );
}
