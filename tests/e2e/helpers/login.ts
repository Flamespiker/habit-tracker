import { Page } from '@playwright/test'

/**
 * Logs in with test credentials from environment variables.
 * Set TEST_EMAIL and TEST_PASSWORD in .env.local or the shell before running tests.
 */
export async function login(page: Page): Promise<void> {
  const email = process.env.TEST_EMAIL ?? ''
  const password = process.env.TEST_PASSWORD ?? ''

  if (!email || !password) {
    throw new Error(
      'TEST_EMAIL and TEST_PASSWORD must be set to run authenticated tests.\n' +
      'Add them to .env.local or export them in your shell.'
    )
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
}
