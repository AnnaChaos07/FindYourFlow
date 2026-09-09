import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://localhost:8791', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview -- --port 8791 --inspector-port 9241',
    url: 'http://localhost:8791',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
