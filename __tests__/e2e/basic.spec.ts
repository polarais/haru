import { test, expect } from '@playwright/test'

test.describe('Basic E2E Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    // Basic page load check
    await expect(page).toHaveTitle(/Haru|Next.js/)
    
    // Check that page content loads (look for any visible element)
    await page.waitForSelector('body')
    
    // Basic interaction test - take screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true })
  })
})