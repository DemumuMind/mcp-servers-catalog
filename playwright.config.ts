import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT || 3100)
const host = process.env.PLAYWRIGHT_HOST || '127.0.0.1'
const baseURL = `http://${host}:${port}`
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER === 'true'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60000,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /(auth|homepage)\.spec\.ts/,
    },
    {
      name: 'chromium-no-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /(auth|homepage)\.spec\.ts/,
      // Run separately: npx playwright test --project=chromium-no-auth
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port} --hostname ${host}`,
    url: baseURL,
    // Keep false by default so tests never run against an unrelated app that
    // happens to occupy the same port. Set PLAYWRIGHT_REUSE_SERVER=true to
    // intentionally target an already-running local server.
    reuseExistingServer,
    timeout: 300000,
  },
})
