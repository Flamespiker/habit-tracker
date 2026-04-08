import { NextResponse } from "next/server";
import { createHabit, toHabit } from "@/lib/db/supabase/habits";
import { createClient } from "@/lib/db/supabase/server";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/habits";

/**
 * POST /api/habits
 * Creates a new habit and returns the mapped Habit object.
 * Body: { name: string; category: string; frequency: string }
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
    const { name, category, frequency } = body;

    if (!name || typeof name !== "string") {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!category || !frequency) {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json(
        { error: "category and frequency are required" },
        { status: 400 },
      );
    }

    const row = await createHabit(
      {
        name: name.trim(),
        category,
        frequency,
        user_id: user.id,
        target_days: [],
      },
      supabase,
    );

    // New habit has no checkins yet — pass [] so streak=0, weekly_data=[0×7]
    logRequest({ route: ROUTE, method: "POST", status: 201, duration_ms: Date.now() - start, userId });
    return NextResponse.json({ habit: toHabit(row, []) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/habits]", err);
    const message =
      err instanceof Error ? err.message : "Failed to create habit";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
