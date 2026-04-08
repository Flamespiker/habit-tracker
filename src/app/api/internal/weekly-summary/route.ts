import { NextResponse } from "next/server";
import { runWeeklySummaryAgent } from "@/lib/ai/weekly-summary-agent";

/**
 * POST /api/internal/weekly-summary
 * Runs the weekly summary agent for the configured internal user and saves
 * the result to MongoDB.
 * Authenticated via x-internal-secret header (no Supabase session required).
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = process.env.INTERNAL_USER_ID;
  if (!userId) {
    return NextResponse.json(
      { error: "INTERNAL_USER_ID is not configured" },
      { status: 500 },
    );
  }

  const doc = await runWeeklySummaryAgent(userId);

  return NextResponse.json(doc, { status: 201 });
}
