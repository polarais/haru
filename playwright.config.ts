import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  outputDir: 'test-results/',
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds per assertion
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable additional Chrome features for testing
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        isMobile: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        isMobile: true,
      },
    },

    // Tablet
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
        isMobile: true,
      },
    },

    // Performance testing project
    {
      name: 'performance',
      testMatch: '**/performance-accessibility.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Throttle network for performance testing
        contextOptions: {
          // Record HAR for performance analysis
          recordHar: { path: 'test-results/performance-trace.har' }
        }
      },
    },

    // Accessibility testing project  
    {
      name: 'accessibility',
      testMatch: '**/performance-accessibility.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable accessibility features
        launchOptions: {
          args: ['--force-prefers-reduced-motion']
        }
      },
    },
  ],

  webServer: {
    command: 'cd haru-app && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test'
    }
  },

  // Global setup and teardown
  globalSetup: require.resolve('./test-setup/global-setup.ts'),
  globalTeardown: require.resolve('./test-setup/global-teardown.ts'),
})