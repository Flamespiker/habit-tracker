import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { runWeeklySummaryAgent } from "@/lib/ai/weekly-summary-agent";

/**
 * POST /api/weekly-summary
 * Runs the LangGraph weekly summary agent for the authenticated user.
 * The agent fetches habit data + coaching history, generates a structured
 * WeeklySummaryContent, and saves it to MongoDB as type: 'weekly_summary'.
 *
 * Returns 201 with { summary } on success.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await runWeeklySummaryAgent(user.id);
    return NextResponse.json({ summary }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/weekly-summary]", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate weekly summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
