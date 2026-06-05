import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage', async ({ page }) => {
    await page.goto('/ru', { timeout: 30000 })
    await expect(page.locator('h1')).toContainText('Awesome MCP Servers')
  })

  test('should have submit page link', async ({ page }) => {
    await page.goto('/ru', { timeout: 30000 })
    const submitLink = page.getByRole('link', { name: 'Отправить' }).first()
    await expect(submitLink).toBeVisible()
    await expect(submitLink).toHaveAttribute('href', '/ru/submit')
  })

  test('should have search input', async ({ page }) => {
    await page.goto('/ru', { timeout: 30000 })
    const searchInput = page.locator('input[placeholder="Поиск MCP серверов..."]:visible').first()
    await expect(searchInput).toBeVisible()
  })
})
