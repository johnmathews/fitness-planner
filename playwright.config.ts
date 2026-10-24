import { defineConfig, devices } from '@playwright/test'

// The browser checks (e2e/): axe, phone width and focus, against the Vite dev server, because the
// style guide (/styleguide) exists only in development. The app's /api is mocked per test
// (e2e/support.ts), so no API server runs. PLAYWRIGHT=1 keeps the Vue DevTools overlay out
// (vite.config.ts).
const PORT = 5179

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { PLAYWRIGHT: '1' },
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
