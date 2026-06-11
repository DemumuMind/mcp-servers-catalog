import { test, expect } from '@playwright/test'

test.describe('Submit Flow', () => {
  test('should display submit page', async ({ page }) => {
    await page.goto('/ru/submit', { timeout: 30000 })
    await expect(page.locator('h1')).toContainText('Отправьте свой MCP-сервер')
    await expect(page.locator('input[placeholder="Brave Search MCP"]:visible')).toBeVisible()
    await expect(page.locator('input[placeholder="https://github.com/owner/repo"]:visible')).toBeVisible()
  })

  test('should show URL validation error', async ({ page }) => {
    await page.goto('/ru/submit', { timeout: 30000 })
    await page.locator('input[placeholder="https://github.com/owner/repo"]:visible').fill('not-a-url')
    await page.getByRole('button', { name: 'Отправить' }).click()
    
    // Zod url validation should show some error
    await expect(page.getByText(/Введите корректный URL|Введите ссылку/)).toBeVisible()
  })
})
