import { test, expect } from '@playwright/test'

test.describe('Collections', () => {
  test('should display collections page', async ({ page }) => {
    await page.goto('/ru/profile/collections', { timeout: 30000 })
    await expect(page.getByRole('heading', { name: 'Мои коллекции' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Новая коллекция' })).toBeVisible()
  })
})
