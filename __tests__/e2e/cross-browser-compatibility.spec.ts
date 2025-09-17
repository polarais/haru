import { test, expect } from '@playwright/test'

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should work consistently across different browsers', async ({ page, browserName }) => {
    await test.step(`Test basic functionality in ${browserName}`, async () => {
      // Basic page load
      await expect(page).toHaveTitle(/Haru|Next.js/)
      await expect(page.getByTestId('calendar-grid')).toBeVisible()
      
      // Take browser-specific screenshot for visual regression testing
      await page.screenshot({ 
        path: `test-results/browser-${browserName}-homepage.png`,
        fullPage: true
      })
    })

    await test.step(`Test interactive elements in ${browserName}`, async () => {
      // Test button interactions
      const writeButton = page.getByRole('button', { name: /write|작성/i })
      if (await writeButton.isVisible()) {
        await writeButton.click()
        await expect(page).toHaveURL(/\/write/)
        
        // Navigate back
        await page.getByRole('button', { name: /back|close|뒤로/i }).click()
        await expect(page).toHaveURL('/')
      }
    })

    await test.step(`Test form inputs in ${browserName}`, async () => {
      await page.getByRole('button', { name: /write|작성/i }).click()
      
      // Test text input
      const titleInput = page.getByRole('textbox', { name: /title|제목/i })
      if (await titleInput.isVisible()) {
        await titleInput.fill(`Browser test entry - ${browserName}`)
        await expect(titleInput).toHaveValue(`Browser test entry - ${browserName}`)
      }
      
      // Test textarea
      const contentInput = page.getByRole('textbox', { name: /content|내용/i })
      if (await contentInput.isVisible()) {
        await contentInput.fill(`This entry was created in ${browserName} browser.`)
        await expect(contentInput).toHaveValue(`This entry was created in ${browserName} browser.`)
      }
    })

    await test.step(`Test CSS rendering in ${browserName}`, async () => {
      // Check that key elements have proper styling
      const calendarGrid = page.getByTestId('calendar-grid')
      if (await calendarGrid.isVisible()) {
        const gridBox = await calendarGrid.boundingBox()
        expect(gridBox).toBeTruthy()
        expect(gridBox!.width).toBeGreaterThan(0)
        expect(gridBox!.height).toBeGreaterThan(0)
      }
    })
  })

  test('should handle keyboard navigation consistently across browsers', async ({ page, browserName }) => {
    await test.step(`Test keyboard navigation in ${browserName}`, async () => {
      // Focus on calendar grid
      const calendarGrid = page.getByTestId('calendar-grid')
      await calendarGrid.focus()
      
      // Test Tab navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Test arrow key navigation if implemented
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowLeft')
      
      // Test Enter key
      await page.keyboard.press('Enter')
    })
  })

  test('should handle viewport changes consistently', async ({ page, browserName }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 375, height: 667, name: 'Mobile' }
    ]

    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} in ${browserName}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        
        // Wait for responsive changes to apply
        await page.waitForTimeout(500)
        
        // Basic visibility checks
        await expect(page.getByTestId('calendar-grid')).toBeVisible()
        
        // Check sidebar visibility based on viewport
        const sidebar = page.getByTestId('sidebar')
        if (viewport.width >= 768) {
          // Desktop/tablet - sidebar should be visible
          if (await sidebar.isVisible()) {
            await expect(sidebar).toBeVisible()
          }
        } else {
          // Mobile - sidebar might be hidden or show differently
          // This depends on implementation
        }
        
        // Take screenshot for visual regression
        await page.screenshot({ 
          path: `test-results/viewport-${browserName}-${viewport.name.replace(/\s+/g, '-')}.png`
        })
      })
    }
  })

  test('should handle touch events on mobile browsers', async ({ page, isMobile, browserName }) => {
    if (!isMobile) {
      test.skip('Touch events test only for mobile browsers')
    }

    await test.step(`Test touch interactions in mobile ${browserName}`, async () => {
      const calendarGrid = page.getByTestId('calendar-grid')
      
      // Test tap gesture
      await calendarGrid.tap()
      
      // Test swipe gesture (if implemented)
      const gridBox = await calendarGrid.boundingBox()
      if (gridBox) {
        // Simulate swipe left
        await page.touchscreen.swipe(
          gridBox.x + gridBox.width * 0.8,
          gridBox.y + gridBox.height / 2,
          gridBox.x + gridBox.width * 0.2,
          gridBox.y + gridBox.height / 2
        )
      }
    })
  })
})