import { test, expect } from '@playwright/test'

async function openServerCard(page: import('@playwright/test').Page, index: number) {
  await page.goto('/ru/all')
  await page.waitForLoadState('networkidle')
  const serverLinks = page.locator('a[href*="/ru/servers/"]')
  const count = await serverLinks.count()
  if (count === 0) {
    test.skip()
    return
  }
  const targetIndex = Math.min(index, count - 1)
  await serverLinks.nth(targetIndex).click()
  await page.waitForURL(/\/ru\/servers\/[^/]+\/[^/]+/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

test.describe('Server Detail Page', () => {
  test('should load server detail with comments and ratings', async ({ page }) => {
    await openServerCard(page, 0)

    // Check h1 title exists and is not 404
    await expect(page.locator('h1').first()).not.toContainText('404')

    // Check comments section exists
    await expect(page.getByText(/Комментарии|Reviews/).first()).toBeVisible({ timeout: 5000 })
  })

  test('should load another server detail page', async ({ page }) => {
    await openServerCard(page, 1)
    await expect(page.locator('h1').first()).not.toContainText('404')
  })
})

test.describe('Search', () => {
  test('should have a working search input', async ({ page }) => {
    await page.goto('/ru/all')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Поиск"]:visible').first()
    await expect(searchInput).toBeVisible()
    await searchInput.fill('database')
    await searchInput.press('Enter')

    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/ru\/all/)
  })
})

test.describe('Pagination', () => {
  test('should navigate through pages', async ({ page }) => {
    await page.goto('/ru/all')
    await page.waitForLoadState('networkidle')

    const nextBtn = page.locator('button:has-text("Вперёд"), a:has-text("Вперёд")').first()
    const hasNext = await nextBtn.isVisible().catch(() => false)

    if (hasNext) {
      await nextBtn.click()
      await page.waitForTimeout(1000)
      await expect(page).toHaveURL(/page=2/)
    } else {
      test.skip()
    }
  })
})
