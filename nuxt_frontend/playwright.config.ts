import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/login",
    env: {
      NODE_OPTIONS: "--max-old-space-size=4096",
      NUXT_HMR_PORT: "24710",
      NUXT_PUBLIC_API_BASE: "/api",
      NUXT_DEV_PROXY_TARGET: "http://127.0.0.1:8000",
    },
    reuseExistingServer: false,
    timeout: 180000,
  },
});
