import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://localhost:8787", headless: true },
  webServer: {
    command: "node tests/start-server.mjs",
    url: "http://localhost:8787/api/healthz",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  reporter: "list",
});
