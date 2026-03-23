import { chromium } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const STORAGE_STATE = path.join(__dirname, '.auth/user.json')

/**
 * Runs once before all tests. Logs in via the UI and saves the Supabase session
 * cookies to .auth/user.json so every test reuses them via storageState,
 * replacing per-test login() calls with a single auth round-trip per CI run.
 */
export default async function globalSetup(): Promise<void> {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true })

  if (!email || !password) {
    // No credentials — write empty state so the file always exists.
    // Tests that require auth will fail with redirect-to-login behaviour.
    fs.writeFileSync(STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://localhost:3000/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('http://localhost:3000/', { waitUntil: 'commit', timeout: 60000 })

  await context.storageState({ path: STORAGE_STATE })
  await browser.close()
}
