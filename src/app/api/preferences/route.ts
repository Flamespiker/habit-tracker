import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import {
  getUserPreferences,
  saveUserPreferences,
} from "@/lib/db/mongo/user-preferences";
import type { IUserPreferences } from "@/lib/db/mongo/models/UserPreferences";

const VALID_COACHING_STYLES = ["motivational", "analytical", "gentle"] as const;

/**
 * GET /api/preferences
 * Returns the authenticated user's MongoDB preferences.
 * Falls back to schema defaults when no document exists yet.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await getUserPreferences(user.id);

  return NextResponse.json({
    coaching_style: prefs?.coaching_style ?? "motivational",
    notification_time: prefs?.notification_time ?? "08:00",
    focus_areas: prefs?.focus_areas ?? [],
  });
}

/**
 * PATCH /api/preferences
 * Upserts the authenticated user's MongoDB preferences.
 * Only fields present in the request body are updated.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json();
  if (typeof body !== "object" || body === null) {
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
      return NextResponse.json(
        { error: "Invalid notification_time — expected HH:MM" },
        { status: 400 },
      );
    }
    update.notification_time = notification_time;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const prefs = await saveUserPreferences(user.id, update);
  return NextResponse.json(prefs);
}
