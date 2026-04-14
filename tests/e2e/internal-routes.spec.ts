import { test, expect } from "@playwright/test";

/**
 * Internal API routes — authenticated by x-internal-secret header, not Supabase session.
 * Tests that require INTERNAL_API_SECRET are skipped when the env var is absent (e.g. forks).
 */

const COACHING_BODY = {
  type: "suggestion",
  content: "Great progress this week — keep it up!",
  model: "claude-sonnet-4-6",
};

test.describe("POST /api/internal/coaching", () => {
  test("returns 201 with correct secret", async ({ request }) => {
    const secret = process.env.INTERNAL_API_SECRET;
    test.skip(!secret, "INTERNAL_API_SECRET not set");

    const res = await request.post("/api/internal/coaching", {
      headers: { "x-internal-secret": secret! },
      data: COACHING_BODY,
    });

    expect(res.status()).toBe(201);
  });

  test("returns 401 with wrong secret", async ({ request }) => {
    const res = await request.post("/api/internal/coaching", {
      headers: { "x-internal-secret": "wrong-secret" },
      data: COACHING_BODY,
    });

    expect(res.status()).toBe(401);
  });
});

test.describe("POST /api/internal/weekly-summary", () => {
  // Marked slow — calls runWeeklySummaryAgent which makes real Claude API calls.
  test("returns 201 with correct secret", async ({ request }) => {
    const secret = process.env.INTERNAL_API_SECRET;
    test.skip(!secret, "INTERNAL_API_SECRET not set");
    test.setTimeout(60000);

    const res = await request.post("/api/internal/weekly-summary", {
      headers: { "x-internal-secret": secret! },
    });

    expect(res.status()).toBe(201);
  });

  test("returns 401 with wrong secret", async ({ request }) => {
    const res = await request.post("/api/internal/weekly-summary", {
      headers: { "x-internal-secret": "wrong-secret" },
    });

    expect(res.status()).toBe(401);
  });
});
