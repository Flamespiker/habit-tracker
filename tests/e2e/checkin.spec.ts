import { test, expect } from "@playwright/test";

test.describe("Habit check-in", () => {

  test("toggles a habit complete from the dashboard", async ({ page }) => {
    await page.goto("/");

    const toggleButtons = page.getByRole("button", {
      name: /Mark complete|Mark incomplete/i,
    });
    const count = await toggleButtons.count();
    test.skip(count === 0, "No habits on dashboard to toggle");

    const markComplete = page
      .getByRole("button", { name: "Mark complete" })
      .first();
    const hasUncompleted = await markComplete.isVisible().catch(() => false);

    if (hasUncompleted) {
      await markComplete.click();
      await expect(
        page.getByRole("button", { name: "Mark incomplete" }).first(),
      ).toBeVisible();
    } else {
      const markIncomplete = page
        .getByRole("button", { name: "Mark incomplete" })
        .first();
      await markIncomplete.click();
      await expect(
        page.getByRole("button", { name: "Mark complete" }).first(),
      ).toBeVisible();
    }
  });

  test("toggles a habit complete from the log page", async ({ page }) => {
    await page.goto("/log");

    await expect(
      page.getByRole("heading", { name: "Daily Log" }),
    ).toBeVisible();

    const toggleButtons = page.getByRole("button", {
      name: /Mark complete|Mark incomplete/i,
    });
    const count = await toggleButtons.count();
    test.skip(count === 0, "No habits on log page to toggle");

    const markComplete = page
      .getByRole("button", { name: "Mark complete" })
      .first();
    const hasUncompleted = await markComplete.isVisible().catch(() => false);

    if (hasUncompleted) {
      await markComplete.click();
      await expect(
        page.getByRole("button", { name: "Mark incomplete" }).first(),
      ).toBeVisible();
    } else {
      const markIncomplete = page
        .getByRole("button", { name: "Mark incomplete" })
        .first();
      await markIncomplete.click();
      await expect(
        page.getByRole("button", { name: "Mark complete" }).first(),
      ).toBeVisible();
    }
  });

  test("persists check-in after page reload", async ({ page }) => {
    await page.goto("/");

    const markComplete = page
      .getByRole("button", { name: "Mark complete" })
      .first();
    const hasUncompleted = await markComplete.isVisible().catch(() => false);
    test.skip(!hasUncompleted, "No uncompleted habits to toggle");

    await markComplete.click();
    await expect(
      page.getByRole("button", { name: "Mark incomplete" }).first(),
    ).toBeVisible();

    // Navigate to confirm the check-in was persisted to Supabase.
    // page.reload() can throw ERR_ABORTED when Next.js streaming SSR is in
    // progress; a fresh goto avoids that race condition.
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("button", { name: "Mark incomplete" }).first(),
    ).toBeVisible();
  });
});
