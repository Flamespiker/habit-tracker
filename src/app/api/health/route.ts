import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { connectToMongoDB } from "@/lib/db/mongo/client";
import { logRequest } from "@/lib/logging";

const ROUTE = "/api/health";
const TIMEOUT_MS = 5000;

type ServiceStatus = "ok" | "error";

/** Resolves to "error" after TIMEOUT_MS — used to cap each connectivity check. */
function timeout(): Promise<"error"> {
  return new Promise((resolve) =>
    setTimeout(() => resolve("error"), TIMEOUT_MS),
  );
}

/**
 * GET /api/health
 * Checks connectivity to Supabase and MongoDB.
 * Each check is capped at 5 seconds via Promise.race.
 * Returns 200 if all systems are healthy, 503 if any check fails.
 * No auth required.
 */
export async function GET() {
  const start = Date.now();
  logRequest({ route: ROUTE, method: "GET" });

  const [supabase, mongodb] = await Promise.all([
    Promise.race([
      (async (): Promise<ServiceStatus> => {
        try {
          const client = createAdminClient();
          const { error } = await client.from("habits").select("id").limit(1);
          return error ? "error" : "ok";
        } catch {
          return "error";
        }
      })(),
      timeout(),
    ]),
    Promise.race([
      (async (): Promise<ServiceStatus> => {
        try {
          await connectToMongoDB();
          return "ok";
        } catch {
          return "error";
        }
      })(),
      timeout(),
    ]),
  ]);

  const allOk = supabase === "ok" && mongodb === "ok";
  const httpStatus = allOk ? 200 : 503;

  logRequest({ route: ROUTE, method: "GET", status: httpStatus, duration_ms: Date.now() - start });
  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      supabase,
      mongodb,
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus },
  );
}
