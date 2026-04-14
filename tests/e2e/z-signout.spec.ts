import { test, expect } from "@playwright/test";

/**
 * Sign-out test — must run LAST (filename z-signout.spec.ts sorts after all others).
 *
 * supabase.auth.signOut() defaults to scope: 'global', which revokes the session
 * token server-side and invalidates .auth/user.json for the rest of the run.
 * Keeping this in a separate file that sorts last alphabetically ensures all other
 * spec files run with valid auth before the session is destroyed.
 */
test.describe("Authentication — sign-out", () => {
  test("sign-out button redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Habit Tracker" }),
    ).toBeVisible();

    // Desktop nav renders the first "Sign out" button; click it
    await page.getByRole("button", { name: "Sign out" }).first().click();

    await page.waitForURL("/login", { waitUntil: "commit", timeout: 30000 });
    await expect(page).toHaveURL("/login");
  });
});
