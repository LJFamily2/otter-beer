import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is left
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Parallel workers — fewer on CI to avoid resource issues
  workers: process.env.CI ? 2 : undefined,

  // Reporter
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["html", { open: "on-failure" }], ["list"]],

  // Global settings for all tests
  use: {
    // Base URL for all page.goto() calls
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",

    // Record traces on first retry (for debugging CI failures)
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Locale for Vietnamese default
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  },

  // Test projects — browser configurations
  projects: [
    // ─── Setup project (auth state) ──────────────────────────
    {
      name: "setup",
      testMatch: "**/e2e/setup/*.ts",
    },

    // ─── Main browser: Chromium ───────────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // ─── Mobile viewport ──────────────────────────────────────
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
    },

    // ─── Uncomment to add Firefox and Safari ──────────────────
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  // Start the Next.js dev server automatically before tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
});
