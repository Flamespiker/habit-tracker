import { NextResponse } from "next/server";
import { saveCoachingResponse } from "@/lib/db/mongo/ai-coaching";
import type { IAiCoaching } from "@/lib/db/mongo/models/AiCoaching";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/internal/coaching";

const VALID_TYPES = ["daily_nudge", "weekly_summary", "suggestion"] as const;

/**
 * POST /api/internal/coaching
 * Saves a coaching response to MongoDB for the configured internal user.
 * Authenticated via x-internal-secret header (no Supabase session required).
 * Body: { type, content, model, habit_context? }
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

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start });
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
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start });
      return NextResponse.json(
        { error: `Invalid type — must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 },
      );
    }
    if (content === undefined) {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start });
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (typeof model !== "string" || model.trim() === "") {
      logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start });
      return NextResponse.json(
        { error: "model is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const doc = await saveCoachingResponse({
      user_id: userId,
      type: type as IAiCoaching["type"],
      content,
      model,
      habit_context: habit_context ?? null,
    });

    logRequest({ route: ROUTE, method: "POST", status: 201, duration_ms: Date.now() - start });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("[POST /api/internal/coaching]", err);
    const message =
      err instanceof Error ? err.message : "Failed to save coaching response";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
