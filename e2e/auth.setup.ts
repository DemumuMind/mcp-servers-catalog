import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123'

setup('authenticate', async ({ page, request }) => {
  setup.setTimeout(60000)
  const csrfResponse = await request.get('/api/auth/csrf')
  const csrfData = await csrfResponse.json()
  const csrfToken = csrfData.csrfToken

  const loginResponse = await request.post('/api/auth/callback/credentials', {
    form: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      csrfToken,
      callbackUrl: '/',
      json: 'true',
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (loginResponse.ok()) {
    const cookies = await request.storageState()
    await page.context().addCookies(cookies.cookies)
  } else {
    await page.goto('/ru/login')
    await page.getByPlaceholder('you@example.com').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(3000)
  }

  await page.goto('/ru/profile')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/Пользователь|admin/).first()).toBeVisible({ timeout: 10000 })

  await page.context().storageState({ path: authFile })
})
