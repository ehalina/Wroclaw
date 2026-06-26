import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT || process.env.PORT || 6173);
const host = '127.0.0.1';
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind ${host}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 15_000
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      }
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5']
      }
    }
  ]
});
