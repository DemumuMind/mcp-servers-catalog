import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/ru/login')
    await expect(page.locator('input[placeholder="you@example.com"]:visible')).toBeVisible()
    await expect(page.locator('input[type="password"]:visible')).toBeVisible()
    await expect(page.locator('form button[type="submit"]')).toBeVisible()
  })

  test('should show register form', async ({ page }) => {
    await page.goto('/ru/register')
    await expect(page.locator('input[placeholder="Ваше имя"]:visible')).toBeVisible()
    await expect(page.locator('input[type="email"]:visible')).toBeVisible()
    await expect(page.locator('form button[type="submit"]')).toBeVisible()
  })

  test('should navigate to submit page', async ({ page }) => {
    await page.goto('/ru')
    await page.getByRole('link', { name: 'Отправить' }).first().click()
    await page.waitForURL(/.*submit/, { timeout: 10000 })
    await expect(page).toHaveURL(/.*submit/)
  })
})

test.describe('Profile Pages (unauthenticated)', () => {
  test('should redirect unauthenticated user from profile to login', async ({ page }) => {
    await page.goto('/ru/profile', { timeout: 30000, waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 })
  })
})
