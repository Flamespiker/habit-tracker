import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { connectToMongoDB } from "@/lib/db/mongo/client";

type ServiceResult = { status: "ok" } | { status: "error"; error: string };

/**
 * GET /api/health
 * Checks connectivity to Supabase and MongoDB.
 * Returns 200 if all systems are healthy, 503 if any check fails.
 */
export async function GET() {
  const [supabase, mongodb] = await Promise.all([
    (async (): Promise<ServiceResult> => {
      try {
        const client = createAdminClient();
        const { error } = await client.from("habits").select("id").limit(1);
        if (error) return { status: "error", error: error.message };
        return { status: "ok" };
      } catch (err) {
        return {
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })(),
    (async (): Promise<ServiceResult> => {
      try {
        await connectToMongoDB();
        return { status: "ok" };
      } catch (err) {
        return {
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })(),
  ]);

  const allOk = supabase.status === "ok" && mongodb.status === "ok";

  return NextResponse.json(
    { supabase, mongodb, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 },
  );
}
