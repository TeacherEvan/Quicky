import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E for Quicky. The webServer config starts `next start -p
 * 8098` automatically (or reuses an already-running one). Tests that
 * hit live Convex APIs need NEXT_PUBLIC_CONVEX_SITE_URL in the
 * environment.
 */
const PORT = Number(process.env.SMOKE_PORT ?? 8098);
const SITE = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      ...process.env,
      NEXT_PUBLIC_CONVEX_SITE_URL: SITE,
    },
  },
});
