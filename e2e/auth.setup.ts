import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page, request }) => {
  setup.setTimeout(60000)
  // Step 1: Get CSRF token
  const csrfResponse = await request.get('/api/auth/csrf')
  const csrfData = await csrfResponse.json()
  const csrfToken = csrfData.csrfToken

  // Step 2: Sign in via credentials callback directly
  const loginResponse = await request.post('/api/auth/callback/credentials', {
    form: {
      email: 'admin@example.com',
      password: 'admin123',
      csrfToken,
      callbackUrl: '/',
      json: 'true',
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  // If API login succeeded, visit profile to set cookies in browser context
  if (loginResponse.ok()) {
    const cookies = await request.storageState()
    await page.context().addCookies(cookies.cookies)
  } else {
    // Fallback: try UI login
    await page.goto('/ru/login')
    await page.getByPlaceholder('you@example.com').fill('admin@example.com')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(3000)
  }

  // Verify logged in
  await page.goto('/ru/profile')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/Пользователь|admin/).first()).toBeVisible({ timeout: 10000 })

  // Save auth state
  await page.context().storageState({ path: authFile })
})
