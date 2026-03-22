import { test, expect } from '@playwright/test'
import { login } from './helpers/login'

test.describe('Goals', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/goals')
  })

  test('displays the goals page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Goals' })).toBeVisible()
    await expect(page.getByRole('button', { name: /New Goal/i })).toBeVisible()
  })

  test('creates a new goal via the dialog', async ({ page }) => {
    const goalTitle = `Test Goal ${Date.now()}`

    // Open the dialog
    await page.getByRole('button', { name: /New Goal/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'New Goal' })).toBeVisible()

    // Fill in the form
    await page.getByLabel('Title').fill(goalTitle)
    await page.getByLabel('Status').selectOption('active')

    // Submit
    await page.getByRole('button', { name: 'Add Goal' }).click()

    // Wait for the dialog to close after form submission
    await page.waitForSelector('[role=dialog]', { state: 'hidden', timeout: 15000 })
    await expect(page.getByText(goalTitle)).toBeVisible()
  })

  test('creates a goal with a target date', async ({ page }) => {
    const goalTitle = `Dated Goal ${Date.now()}`

    await page.getByRole('button', { name: /New Goal/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByLabel('Title').fill(goalTitle)
    await page.getByLabel('Target Date').fill('2026-12-31')
    await page.getByLabel('Status').selectOption('active')

    await page.getByRole('button', { name: 'Add Goal' }).click()

    // Wait for the dialog to close after form submission
    await page.waitForSelector('[role=dialog]', { state: 'hidden', timeout: 15000 })
    await expect(page.getByText(goalTitle)).toBeVisible()
  })

  test('cancels goal creation without adding a goal', async ({ page }) => {
    await page.getByRole('button', { name: /New Goal/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByLabel('Title').fill('Should Not Appear')
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Should Not Appear')).not.toBeVisible()
  })

  test('navigates to goal detail page', async ({ page }) => {
    // Wait for GoalsClient to render past the loading skeleton
    await expect(page.getByRole('heading', { name: 'Goals' })).toBeVisible()

    // Skip if no goal detail links exist
    const firstGoalLink = page.locator('a[href^="/goals/"]').first()
    const hasGoalLink = await firstGoalLink.isVisible().catch(() => false)
    test.skip(!hasGoalLink, 'No goals exist to navigate to')

    await firstGoalLink.click()
    await page.waitForURL(/\/goals\/.+/, { timeout: 10000 })
    await expect(page.getByRole('link', { name: /Back to Goals/i })).toBeVisible()
  })
})
