import { NextResponse } from "next/server";
import { createGoal, createGoalHabits, toGoal } from "@/lib/db/supabase/goals";
import { createClient } from "@/lib/db/supabase/server";
import type { Goal } from "@/lib/types";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/goals";

/**
 * POST /api/goals
 * Creates a new goal, links any provided habits via goal_habits, and returns the mapped Goal.
 * Body: { title: string; target_date?: string | null; status?: string; habit_ids?: string[] }
 */
export async function POST(request: Request) {
  const start = Date.now();
  let userId: string | undefined;
  logRequest({ route: ROUTE, method: "POST" });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;

    if (!user) {
      logRequest({ route: ROUTE, method: "POST", status: 401, duration_ms: Date.now() - start });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, target_date, status, habit_ids } = body;

    if (!title || typeof title !== "string") {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const row = await createGoal(
      {
        title: title.trim(),
        target_date: target_date ?? null,
        status: status ?? "active",
        user_id: user.id,
      },
      supabase,
    );

    const linkedIds: string[] = Array.isArray(habit_ids) ? habit_ids : [];
    if (linkedIds.length > 0) {
      await createGoalHabits(row.id, linkedIds, supabase);
    }

    const goal: Goal = { ...toGoal(row), habit_ids: linkedIds };

    logRequest({ route: ROUTE, method: "POST", status: 201, duration_ms: Date.now() - start, userId });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/goals]", err);
    const message =
      err instanceof Error ? err.message : "Failed to create goal";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
