import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import {
  getCoachingHistory,
  saveCoachingResponse,
} from "@/lib/db/mongo/ai-coaching";
import type { IAiCoaching } from "@/lib/db/mongo/models/AiCoaching";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/coaching";

const VALID_TYPES = ["daily_nudge", "weekly_summary", "suggestion"] as const;

/**
 * GET /api/coaching
 * Returns the authenticated user's coaching history from MongoDB, newest first.
 * Accepts an optional `limit` query param (default 20).
 */
export async function GET(request: Request) {
  const start = Date.now();
  let userId: string | undefined;
  logRequest({ route: ROUTE, method: "GET" });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;

    if (!user) {
      logRequest({ route: ROUTE, method: "GET", status: 401, duration_ms: Date.now() - start });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100)
      : 20;

    const history = await getCoachingHistory(user.id, limit);

    logRequest({ route: ROUTE, method: "GET", status: 200, duration_ms: Date.now() - start, userId });
    return NextResponse.json(history);
  } catch (err) {
    console.error("[GET /api/coaching]", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch coaching history";
    logRequest({ route: ROUTE, method: "GET", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/coaching
 * Saves a new coaching response to MongoDB for the authenticated user.
 * Body: { type, content, model, habit_context? }
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

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { type, content, model, habit_context } = body as Record<
      string,
      unknown
    >;

    if (!VALID_TYPES.includes(type as IAiCoaching["type"])) {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json(
        { error: `Invalid type — must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }
    if (content === undefined) {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (typeof model !== "string" || model.trim() === "") {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json(
        { error: "model is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const doc = await saveCoachingResponse({
      user_id: user.id,
      type: type as IAiCoaching["type"],
      content,
      model,
      habit_context: habit_context ?? null,
    });

    logRequest({ route: ROUTE, method: "POST", status: 201, duration_ms: Date.now() - start, userId });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("[POST /api/coaching]", err);
    const message =
      err instanceof Error ? err.message : "Failed to save coaching response";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
