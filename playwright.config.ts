import { defineConfig, devices } from "@playwright/test";
import { env } from "node:process";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4173"
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !env.CI
  }
});
