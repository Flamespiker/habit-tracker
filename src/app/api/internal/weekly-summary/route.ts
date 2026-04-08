import { NextResponse } from "next/server";
import { runWeeklySummaryAgent } from "@/lib/ai/weekly-summary-agent";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/internal/weekly-summary";

/**
 * POST /api/internal/weekly-summary
 * Runs the weekly summary agent for the configured internal user and saves
 * the result to MongoDB.
 * Authenticated via x-internal-secret header (no Supabase session required).
 */
export async function POST(request: Request) {
  const start = Date.now();
  logRequest({ route: ROUTE, method: "POST" });

  try {
    const secret = request.headers.get("x-internal-secret");
    if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
      logRequest({ route: ROUTE, method: "POST", status: 401, duration_ms: Date.now() - start });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = process.env.INTERNAL_USER_ID;
    if (!userId) {
      logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, error: "INTERNAL_USER_ID is not configured" });
      return NextResponse.json(
        { error: "INTERNAL_USER_ID is not configured" },
        { status: 500 },
      );
    }

    const doc = await runWeeklySummaryAgent(userId);

    logRequest({ route: ROUTE, method: "POST", status: 201, duration_ms: Date.now() - start });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("[POST /api/internal/weekly-summary]", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate weekly summary";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
