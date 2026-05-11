import { test, expect } from '@playwright/test'

test.describe('Advanced Search', () => {
  test('should load the page', async ({ page }) => {
    await page.goto('/ru/advanced-search', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText('Расширенный поиск')
  })
})
