import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { runSupportAgent } from "@/lib/ai/support-agent";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/support";

/**
 * POST /api/support
 * Runs the LangGraph support agent for the authenticated user.
 * Body: { question: string }
 *
 * Returns 200 with { answer } on success.
 */
export async function POST(request: Request) {
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

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    logRequest({ route: ROUTE, method: "POST", status: 400, duration_ms: Date.now() - start, userId });
    return NextResponse.json(
      { error: "question is required" },
      { status: 400 },
    );
  }

  try {
    const answer = await runSupportAgent(user.id, question);
    logRequest({ route: ROUTE, method: "POST", status: 200, duration_ms: Date.now() - start, userId });
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[POST /api/support]", err);
    const message =
      err instanceof Error ? err.message : "Failed to answer question";
    logRequest({ route: ROUTE, method: "POST", status: 500, duration_ms: Date.now() - start, userId, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
