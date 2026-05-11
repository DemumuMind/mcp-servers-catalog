import { test, expect } from '@playwright/test'

test.describe('Profile Pages', () => {
  test('should display profile overview', async ({ page }) => {
    await page.goto('/ru/profile', { timeout: 30000 })
    await expect(page.getByText(/Пользователь|admin/).first()).toBeVisible()
    await expect(page.locator('h1')).toContainText(/Профиль|Пользователь/)
  })

  test('should load bookmarks page', async ({ page }) => {
    await page.goto('/ru/profile/bookmarks', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText(/закладки/i)
  })

  test('should load comments page', async ({ page }) => {
    await page.goto('/ru/profile/comments', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText(/комментарии/i)
  })

  test('should load ratings page', async ({ page }) => {
    await page.goto('/ru/profile/ratings', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText(/оценки/i)
  })

  test('should load history page', async ({ page }) => {
    await page.goto('/ru/profile/history', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText(/история/i)
  })

  test('should load settings page', async ({ page }) => {
    await page.goto('/ru/profile/settings', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toContainText(/настройки/i)
  })
})
