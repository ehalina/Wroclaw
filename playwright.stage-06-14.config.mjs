import { defineConfig, devices } from '@playwright/test';

const port = process.env.E2E_PORT || '6173';

export default defineConfig({
  testDir: './tools/stage-06-14',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory www`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe'
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
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
