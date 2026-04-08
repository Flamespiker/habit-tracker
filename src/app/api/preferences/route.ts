import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import {
  getUserPreferences,
  saveUserPreferences,
} from "@/lib/db/mongo/user-preferences";
import type { IUserPreferences } from "@/lib/db/mongo/models/UserPreferences";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/preferences";

const VALID_COACHING_STYLES = ["motivational", "analytical", "gentle"] as const;

/**
 * GET /api/preferences
 * Returns the authenticated user's MongoDB preferences.
 * Falls back to schema defaults when no document exists yet.
 */
export async function GET() {
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

    const prefs = await getUserPreferences(user.id);

    logRequest({ route: ROUTE, method: "GET", status: 200, duration_ms: Date.now() - start, userId });
    return NextResponse.json({
      coaching_style: prefs?.coaching_style ?? "motivational",
      notification_time: prefs?.notification_time ?? "08:00",
      focus_areas: prefs?.focus_areas ?? [],
    });
  } catch (err) {
    console.error("[GET /api/preferences]", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch preferences";
    logRequest({ route: ROUTE, method: "GET", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/preferences
 * Upserts the authenticated user's MongoDB preferences.
 * Only fields present in the request body are updated.
 */
export async function PATCH(request: Request) {
  const start = Date.now();
  let userId: string | undefined;
  logRequest({ route: ROUTE, method: "PATCH" });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id;

    if (!user) {
      logRequest({ route: ROUTE, method: "PATCH", status: 401, duration_ms: Date.now() - start });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      logRequest({ route: ROUTE, method: "PATCH", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const update: Partial<Omit<IUserPreferences, "user_id">> = {};
    const { coaching_style, notification_time } = body as Record<string, unknown>;

    if (coaching_style !== undefined) {
      if (
        !VALID_COACHING_STYLES.includes(
          coaching_style as IUserPreferences["coaching_style"],
        )
      ) {
        logRequest({ route: ROUTE, method: "PATCH", status: 400, duration_ms: Date.now() - start, userId });
        return NextResponse.json(
          { error: "Invalid coaching_style" },
          { status: 400 },
        );
      }
      update.coaching_style =
        coaching_style as IUserPreferences["coaching_style"];
    }

    if (notification_time !== undefined) {
      if (
        typeof notification_time !== "string" ||
        !/^\d{2}:\d{2}$/.test(notification_time)
      ) {
        logRequest({ route: ROUTE, method: "PATCH", status: 400, duration_ms: Date.now() - start, userId });
        return NextResponse.json(
          { error: "Invalid notification_time — expected HH:MM" },
          { status: 400 },
        );
      }
      update.notification_time = notification_time;
    }

    if (Object.keys(update).length === 0) {
      logRequest({ route: ROUTE, method: "PATCH", status: 400, duration_ms: Date.now() - start, userId });
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const prefs = await saveUserPreferences(user.id, update);

    logRequest({ route: ROUTE, method: "PATCH", status: 200, duration_ms: Date.now() - start, userId });
    return NextResponse.json(prefs);
  } catch (err) {
    console.error("[PATCH /api/preferences]", err);
    const message =
      err instanceof Error ? err.message : "Failed to update preferences";
    logRequest({ route: ROUTE, method: "PATCH", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
