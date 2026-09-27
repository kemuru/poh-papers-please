import { defineConfig, devices } from '@playwright/test';

// Must match server.port in vite.config.ts: with reuseExistingServer, whatever answers on this
// port gets tested, and other worktrees of this repo run their own dev servers side by side.
const PORT = 5175;

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
  },
});
