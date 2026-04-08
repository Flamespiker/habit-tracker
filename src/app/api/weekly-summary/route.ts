import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { runWeeklySummaryAgent } from "@/lib/ai/weekly-summary-agent";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/weekly-summary";

/**
 * POST /api/weekly-summary
 * Runs the LangGraph weekly summary agent for the authenticated user.
 * The agent fetches habit data + coaching history, generates a structured
 * WeeklySummaryContent, and saves it to MongoDB as type: 'weekly_summary'.
 *
 * Returns 201 with { summary } on success.
 */
export async function POST() {
  const start = Date.now();
  let userId: string | undefined;
  logRequest({ route: ROUTE, method: "POST" });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  userId = user?.id;

  if (!user) {
    logRequest({ route: ROUTE, method: "POST", status: 401, duration_ms: Date.now() - start });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runWeeklySummaryAgent(user.id);
    logRequest({ route: ROUTE, method: "POST", status: 201, duration_ms: Date.now() - start, userId });
    return NextResponse.json({ summary }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/weekly-summary]", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate weekly summary";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
