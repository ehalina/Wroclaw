import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT || process.env.PORT || 6173);
const host = '127.0.0.1';
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: './tools/stage-06-23',
  timeout: 45_000,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind ${host}`,
    reuseExistingServer: false,
    timeout: 15_000,
    url: baseURL
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { height: 800, width: 1280 }
      }
    },
    {
      name: 'mobile-pixel5',
      use: {
        ...devices['Pixel 5']
      }
    }
  ]
});
