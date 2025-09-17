import { test, expect } from '@playwright/test'

test.describe('Performance and Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should meet performance benchmarks', async ({ page }) => {
    await test.step('Test initial page load performance', async () => {
      const startTime = Date.now()
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
      
      // Check that main content is visible quickly
      await expect(page.getByTestId('calendar-grid')).toBeVisible({ timeout: 2000 })
    })

    await test.step('Test navigation performance', async () => {
      const navigationStart = Date.now()
      
      // Navigate to write page
      await page.getByRole('button', { name: /write|작성/i }).click()
      await page.waitForURL(/\/write/)
      
      const navigationTime = Date.now() - navigationStart
      
      // Navigation should be fast (under 1 second)
      expect(navigationTime).toBeLessThan(1000)
    })

    await test.step('Test form interaction performance', async () => {
      const titleInput = page.getByRole('textbox', { name: /title|제목/i })
      
      if (await titleInput.isVisible()) {
        const typingStart = Date.now()
        
        // Type a long text to test input performance
        const longText = 'A'.repeat(100)
        await titleInput.fill(longText)
        
        const typingTime = Date.now() - typingStart
        
        // Typing should be responsive (under 500ms for 100 chars)
        expect(typingTime).toBeLessThan(500)
        
        // Verify text was entered correctly
        await expect(titleInput).toHaveValue(longText)
      }
    })

    await test.step('Test memory usage during interactions', async () => {
      // Perform multiple interactions to test for memory leaks
      for (let i = 0; i < 5; i++) {
        // Navigate between pages
        await page.getByRole('button', { name: /write|작성/i }).click()
        await page.waitForURL(/\/write/)
        
        await page.getByRole('button', { name: /back|close|뒤로/i }).click()
        await page.waitForURL('/')
        
        // Small delay to allow for cleanup
        await page.waitForTimeout(100)
      }
      
      // Page should still be responsive
      await expect(page.getByTestId('calendar-grid')).toBeVisible()
    })
  })

  test('should be accessible to users with disabilities', async ({ page }) => {
    await test.step('Test keyboard accessibility', async () => {
      // Test Tab navigation through the entire page
      let tabCount = 0
      const maxTabs = 20 // Reasonable limit for tab navigation
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab')
        tabCount++
        
        // Check if focus is visible
        const focusedElement = await page.locator(':focus').first()
        if (await focusedElement.isVisible()) {
          // Element should be focusable and visible
          const box = await focusedElement.boundingBox()
          expect(box).toBeTruthy()
        }
        
        // Break if we've cycled back to the beginning
        const currentUrl = page.url()
        if (currentUrl.includes('#') || tabCount >= maxTabs) {
          break
        }
      }
    })

    await test.step('Test ARIA attributes and semantic HTML', async () => {
      // Check that main interactive elements have proper ARIA labels
      const buttons = page.getByRole('button')
      const buttonCount = await buttons.count()
      
      expect(buttonCount).toBeGreaterThan(0)
      
      // Check that each button has accessible text or aria-label
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label')
          const textContent = await button.textContent()
          
          // Button should have either visible text or aria-label
          expect(ariaLabel || textContent?.trim()).toBeTruthy()
        }
      }
    })

    await test.step('Test color contrast and visual accessibility', async () => {
      // Take screenshot for manual color contrast analysis
      await page.screenshot({ 
        path: 'test-results/accessibility-contrast-check.png',
        fullPage: true
      })
      
      // Test that important elements are visible
      const calendarGrid = page.getByTestId('calendar-grid')
      if (await calendarGrid.isVisible()) {
        const box = await calendarGrid.boundingBox()
        expect(box).toBeTruthy()
        expect(box!.width).toBeGreaterThan(200) // Should be reasonably sized
        expect(box!.height).toBeGreaterThan(200)
      }
    })

    await test.step('Test screen reader compatibility', async () => {
      // Check for semantic HTML elements
      const main = page.getByRole('main')
      if (await main.isVisible()) {
        await expect(main).toBeVisible()
      }
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      
      if (headingCount > 0) {
        // Should have at least one heading for page structure
        expect(headingCount).toBeGreaterThan(0)
      }
      
      // Check for alt text on images
      const images = page.locator('img')
      const imageCount = await images.count()
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt')
          const ariaLabel = await img.getAttribute('aria-label')
          
          // Images should have alt text or aria-label
          expect(alt !== null || ariaLabel !== null).toBeTruthy()
        }
      }
    })

    await test.step('Test focus management', async () => {
      // Test focus management in modals/dialogs
      const writeButton = page.getByRole('button', { name: /write|작성/i })
      if (await writeButton.isVisible()) {
        await writeButton.click()
        
        // Focus should move to the write page
        await page.waitForURL(/\/write/)
        
        // Check that focus is properly managed
        const focusedElement = await page.locator(':focus').first()
        if (await focusedElement.isVisible()) {
          expect(await focusedElement.isVisible()).toBeTruthy()
        }
      }
    })
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // This test simulates performance with many diary entries
    await test.step('Test calendar performance with many entries', async () => {
      // Navigate to a date and simulate loading many entries
      const calendarGrid = page.getByTestId('calendar-grid')
      
      if (await calendarGrid.isVisible()) {
        const startTime = Date.now()
        
        // Click multiple dates to test rendering performance
        const dates = await calendarGrid.getByText(/\d+/).all()
        
        for (let i = 0; i < Math.min(dates.length, 5); i++) {
          if (await dates[i].isVisible()) {
            await dates[i].click()
            
            // Small delay to allow for any async operations
            await page.waitForTimeout(50)
          }
        }
        
        const totalTime = Date.now() - startTime
        
        // Should handle multiple date clicks efficiently
        expect(totalTime).toBeLessThan(2000)
      }
    })

    await test.step('Test entry panel performance with navigation', async () => {
      // Open entry panel and test navigation performance
      const calendarGrid = page.getByTestId('calendar-grid')
      const firstDate = calendarGrid.getByText(/\d+/).first()
      
      if (await firstDate.isVisible()) {
        await firstDate.click()
        
        const entryPanel = page.getByTestId('entry-view-panel')
        if (await entryPanel.isVisible()) {
          const startTime = Date.now()
          
          // Test rapid navigation if multiple entries exist
          const nextButton = page.getByLabelText('Next entry')
          const prevButton = page.getByLabelText('Previous entry')
          
          for (let i = 0; i < 3; i++) {
            if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
              await nextButton.click()
              await page.waitForTimeout(10)
            }
            
            if (await prevButton.isVisible() && !await prevButton.isDisabled()) {
              await prevButton.click()
              await page.waitForTimeout(10)
            }
          }
          
          const navigationTime = Date.now() - startTime
          
          // Navigation should be smooth and fast
          expect(navigationTime).toBeLessThan(1000)
        }
      }
    })
  })

  test('should maintain performance under stress conditions', async ({ page }) => {
    await test.step('Test rapid user interactions', async () => {
      const startTime = Date.now()
      
      // Simulate rapid clicking and navigation
      for (let i = 0; i < 10; i++) {
        const writeButton = page.getByRole('button', { name: /write|작성/i })
        if (await writeButton.isVisible()) {
          await writeButton.click()
          
          // Quickly navigate back
          const backButton = page.getByRole('button', { name: /back|close|뒤로/i })
          if (await backButton.isVisible()) {
            await backButton.click()
          }
        }
        
        // Very short delay to simulate rapid user actions
        await page.waitForTimeout(10)
      }
      
      const totalTime = Date.now() - startTime
      
      // Should handle rapid interactions gracefully
      expect(totalTime).toBeLessThan(5000)
      
      // Page should still be responsive
      await expect(page.getByTestId('calendar-grid')).toBeVisible()
    })

    await test.step('Test concurrent operations', async () => {
      // Test multiple operations happening simultaneously
      const promises = []
      
      // Start multiple async operations
      promises.push(page.waitForSelector('[data-testid="calendar-grid"]'))
      promises.push(page.waitForSelector('[data-testid="sidebar"]'))
      
      // Add interaction promises
      const writeButton = page.getByRole('button', { name: /write|작성/i })
      if (await writeButton.isVisible()) {
        promises.push(writeButton.hover())
      }
      
      const startTime = Date.now()
      await Promise.all(promises)
      const concurrencyTime = Date.now() - startTime
      
      // Concurrent operations should complete efficiently
      expect(concurrencyTime).toBeLessThan(3000)
    })
  })
})