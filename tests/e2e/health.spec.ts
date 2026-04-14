import { test, expect } from "@playwright/test";

/**
 * Health check endpoint — verifies both Supabase and MongoDB are reachable.
 * No auth required; this route is public.
 */
test("GET /api/health returns ok for all services", async ({ request }) => {
  const res = await request.get("/api/health");

  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.supabase).toBe("ok");
  expect(body.mongodb).toBe("ok");
  expect(typeof body.timestamp).toBe("string");
});
