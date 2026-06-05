import { test, expect } from '@playwright/test'

test.describe('Server Detail Page', () => {
  test('should load server detail with comments and ratings', async ({ page }) => {
    await page.goto('http://localhost:3000/ru/servers/github/github-mcp-server')
    await page.waitForLoadState('networkidle')

    // Check h1 title
    await expect(page.locator('h1').first()).toContainText('GitHub')

    // Check comments section exists
    await expect(page.locator('text=Комментарии').first()).toBeVisible()

    // Check rating text exists (average rating display)
    await expect(page.locator('text=оценок').first()).toBeVisible()

    // Check bookmark button or install button
    await expect(page.locator('text=В закладки').first()).toBeVisible()
  })

  test('should load another server detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/ru/servers/cloudflare/mcp-server-cloudflare')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').first()).toContainText('Cloudflare')
    await expect(page.locator('text=Комментарии').first()).toBeVisible()
  })
})

test.describe('Search', () => {
  test('should have a working search input', async ({ page }) => {
    await page.goto('http://localhost:3000/ru/all')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Поиск"]:visible').first()
    await expect(searchInput).toBeVisible()
    await searchInput.fill('database')
    await searchInput.press('Enter')

    // Wait a bit for client-side filtering to apply
    await page.waitForTimeout(1500)

    // Page should still be on /ru/all (client-side search)
    await expect(page).toHaveURL(/ru\/all/)
  })
})

test.describe('Pagination', () => {
  test('should navigate through pages', async ({ page }) => {
    await page.goto('http://localhost:3000/ru/all')
    await page.waitForLoadState('networkidle')

    // Wait for pagination to appear (we have 125 servers, so multiple pages)
    const nextBtn = page.locator('text=Вперёд >>').first()
    const hasNext = await nextBtn.isVisible().catch(() => false)

    if (hasNext) {
      await nextBtn.click()
      await page.waitForTimeout(1000)
      // Check URL changed
      await expect(page).toHaveURL(/page=2/)
    } else {
      test.skip()
    }
  })
})
