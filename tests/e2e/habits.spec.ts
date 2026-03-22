import { test, expect } from '@playwright/test'
import { login } from './helpers/login'

test.describe('Habits', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/habits')
  })

  test('displays the habits page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Habits' })).toBeVisible()
    await expect(page.getByRole('button', { name: /New Habit/i })).toBeVisible()
  })

  test('creates a new habit via the dialog', async ({ page }) => {
    const habitName = `Test Habit ${Date.now()}`

    // Open the dialog
    await page.getByRole('button', { name: /New Habit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'New Habit' })).toBeVisible()

    // Fill in the form
    await page.getByLabel('Name').fill(habitName)
    await page.getByLabel('Category').selectOption('health')
    await page.getByLabel('Frequency').selectOption('daily')

    // Submit
    await page.getByRole('button', { name: 'Add Habit' }).click()

    // Dialog should close and new habit should appear in the list
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await page.waitForLoadState('networkidle')
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(habitName)).toBeVisible()
  })

  test('cancels habit creation without adding a habit', async ({ page }) => {
    await page.getByRole('button', { name: /New Habit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByLabel('Name').fill('Should Not Appear')
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Should Not Appear')).not.toBeVisible()
  })

  test('toggles a habit check-in on the habits page', async ({ page }) => {
    // Ensure at least one habit exists
    const cards = page.locator('[aria-label="Mark complete"], [aria-label="Mark incomplete"]')
    const count = await cards.count()
    test.skip(count === 0, 'No habits exist to toggle — create one first')

    // Find the first uncompleted habit and mark it complete
    const markComplete = page.getByRole('button', { name: 'Mark complete' }).first()
    const hasUncompleted = await markComplete.isVisible().catch(() => false)

    if (hasUncompleted) {
      await markComplete.click()
      // The button should now show "Mark incomplete"
      await expect(
        page.getByRole('button', { name: 'Mark incomplete' }).first()
      ).toBeVisible()
    } else {
      // All habits are already complete — toggle one back
      const markIncomplete = page.getByRole('button', { name: 'Mark incomplete' }).first()
      await markIncomplete.click()
      await expect(
        page.getByRole('button', { name: 'Mark complete' }).first()
      ).toBeVisible()
    }
  })
})
