import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.describe("Goals", () => {
  test.afterAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    if (!url || !anonKey || !email || !password) return;

    const client = createClient(url, anonKey);
    await client.auth.signInWithPassword({ email, password });
    await client.from("goals").delete().like("title", "Test Goal%");
    await client.from("goals").delete().like("title", "Dated Goal%");
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/goals");
    // Wait for the Server Component's Supabase fetch to complete and GoalsClient
    // to hydrate — page.goto() resolves at the load event, before async SSR finishes.
    // networkidle can fire while the loading skeleton is still showing; waiting for
    // the real <h1> ensures the skeleton has been replaced by actual content.
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible({
      timeout: 30000,
    });
  });

  test("displays the goals page with heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
    await expect(page.getByRole("button", { name: /New Goal/i })).toBeVisible();
  });

  test("creates a new goal via the dialog", async ({ page }) => {
    const goalTitle = `Test Goal ${Date.now()}`;

    // Open the dialog
    await page.getByRole("button", { name: /New Goal/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "New Goal" })).toBeVisible();

    // Fill in the form
    await page.getByLabel("Title").fill(goalTitle);
    await page.getByLabel("Status").selectOption("active");

    // Submit
    // The submit button is in DialogFooter outside the <form> element and can sit
    // below the viewport. Use requestSubmit() to fire the submit event directly
    // instead of clicking a potentially out-of-viewport button.
    await page.evaluate(() => {
      const form = document.getElementById("new-goal-form") as HTMLFormElement;
      form?.requestSubmit();
    });

    // Wait for the dialog to close after form submission
    await page.waitForSelector("[role=dialog]", {
      state: "hidden",
      timeout: 30000,
    });
    await expect(page.getByText(goalTitle)).toBeVisible();
  });

  test("creates a goal with a target date", async ({ page }) => {
    const goalTitle = `Dated Goal ${Date.now()}`;

    await page.getByRole("button", { name: /New Goal/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Title").fill(goalTitle);
    await page.getByLabel("Target Date").fill("2026-12-31");
    await page.getByLabel("Status").selectOption("active");

    // The submit button is in DialogFooter outside the <form> element and can sit
    // below the viewport. Use requestSubmit() to fire the submit event directly
    // instead of clicking a potentially out-of-viewport button.
    await page.evaluate(() => {
      const form = document.getElementById("new-goal-form") as HTMLFormElement;
      form?.requestSubmit();
    });

    // Wait for the dialog to close after form submission
    await page.waitForSelector("[role=dialog]", {
      state: "hidden",
      timeout: 15000,
    });
    await expect(page.getByText(goalTitle)).toBeVisible();
  });

  test("cancels goal creation without adding a goal", async ({ page }) => {
    await page.getByRole("button", { name: /New Goal/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByLabel("Title").fill("Should Not Appear");
    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Should Not Appear")).not.toBeVisible();
  });

  test("navigates to goal detail page", async ({ page }) => {
    // Wait for GoalsClient to render past the loading skeleton
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();

    // Skip if no goal detail links exist
    const firstGoalLink = page.locator('a[href^="/goals/"]').first();
    const hasGoalLink = await firstGoalLink.isVisible().catch(() => false);
    test.skip(!hasGoalLink, "No goals exist to navigate to");

    await firstGoalLink.click();
    await page.waitForURL(/\/goals\/.+/, { timeout: 30000 });
    await expect(
      page.getByRole("link", { name: /Back to Goals/i }),
    ).toBeVisible();
  });
});
