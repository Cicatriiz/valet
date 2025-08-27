import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  webServer: {
    command: "pnpm dev --port 3030",
    url: "http://localhost:3030",
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: "http://localhost:3030",
    headless: true,
    video: process.env.PW_VIDEO === 'on' ? 'on' : 'off',
    screenshot: 'only-on-failure',
  },
});

