import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Prevent test.only in CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  use: {
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',  // Auto-screenshot on failure
    video: 'retain-on-failure',     // Keep videos when tests fail
    trace: 'retain-on-failure',     // Playwright trace for debugging
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment these if you want to test on other browsers
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
  
  reporter: [
    ['html'],
    ['github'],  // GitHub Actions integration
    ['playwright-ctrf-json-reporter', {
      outputDir: 'ctrf',
      outputFile: 'ctrf-report.json',
    }]
  ],
});
