import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  // Tests 1-3 must start without an injected session — clear any storageState
  // so the global auth setup cookie doesn't pre-authenticate the browser.
  test.describe("unauthenticated flows", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("redirects unauthenticated users to /login", async ({ page }) => {
      await page.goto("/");
      await page.waitForURL("/login");
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email").fill("nobody@example.com");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: "Sign in" }).click();
      // Should stay on /login and show an error
      await expect(page).toHaveURL("/login");
      await expect(
        page.getByRole("alert").or(page.locator("p.text-destructive")),
      ).toBeVisible();
    });

    test("logs in with valid credentials and lands on dashboard", async ({
      page,
    }) => {
      const email = process.env.TEST_EMAIL ?? "";
      const password = process.env.TEST_PASSWORD ?? "";
      test.skip(!email || !password, "TEST_EMAIL and TEST_PASSWORD not set");

      await page.goto("/login");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();

      await page.waitForURL("/", { waitUntil: "commit", timeout: 60000 });
      await expect(
        page.getByRole("heading", { name: "Habit Tracker" }),
      ).toBeVisible();
    });
  });

  // Session is injected via storageState from globalSetup — no login needed.
  test("redirects authenticated users away from /login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForURL("/", { waitUntil: "commit" });
  });

});
