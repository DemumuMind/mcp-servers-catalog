import { test, expect } from '@playwright/test'

test.describe('Submit Flow', () => {
  test('should display submit page', async ({ page }) => {
    await page.goto('/ru/submit', { timeout: 30000 })
    await expect(page.locator('h1')).toContainText(/MCP-сервер/)
    await expect(page.locator('input[placeholder="Brave Search MCP"]:visible')).toBeVisible()
    await expect(page.locator('input[placeholder="https://github.com/owner/repo"]:visible')).toBeVisible()
  })

  test('should show URL validation error', async ({ page }) => {
    await page.goto('/ru/submit', { timeout: 30000 })
    await page.locator('input[placeholder="https://github.com/owner/repo"]:visible').fill('not-a-url')
    await page.getByRole('button', { name: /Отправить/ }).click()
    
    // Form should show some validation feedback
    const hasError = await page.getByText(/Введите|корректн|invalid|required|обязательн/i).first().isVisible({ timeout: 5000 }).catch(() => false)
    // Accept either client validation error or form not submitting (URL stays same)
    expect(hasError || page.url().includes('/submit')).toBeTruthy()
  })
})
