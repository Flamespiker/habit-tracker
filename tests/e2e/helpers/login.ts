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
  console.log('[login] filling email')
  await page.getByLabel('Email').fill(email)
  console.log('[login] filling password')
  await page.getByLabel('Password').fill(password)
  console.log('[login] clicking Sign in')
  const responsePromise = page.waitForResponse(
    (res) => res.request().method() === 'POST',
    { timeout: 35000 }
  )
  await page.getByRole('button', { name: 'Sign in' }).click()
  console.log('[login] waiting for POST response')
  try {
    const response = await responsePromise
    console.log('[login] POST response:', response.status(), response.url())
  } catch (e) {
    console.log('[login] no POST response received within 35s:', e)
  }
  console.log('[login] waiting for URL /')
  await page.waitForURL('/', { waitUntil: 'commit', timeout: 60000 })
  console.log('[login] reached /')
}
