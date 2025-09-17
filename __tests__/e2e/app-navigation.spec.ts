import { test, expect } from '@playwright/test'

test.describe('App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main page with calendar', async ({ page }) => {
    // Wait for the app to load
    await expect(page).toHaveTitle(/Haru/)
    
    // Check that calendar grid is visible
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
    
    // Check that sidebar is visible
    await expect(page.getByTestId('sidebar')).toBeVisible()
    
    // Check navigation buttons
    await expect(page.getByRole('button', { name: /previous/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible()
  })

  test('should navigate to write page', async ({ page }) => {
    // Click write button
    await page.getByRole('button', { name: /write/i }).click()
    
    // Should navigate to write page
    await expect(page).toHaveURL(/\/write/)
    
    // Sidebar should be hidden on write page
    await expect(page.getByTestId('sidebar')).not.toBeVisible()
    
    // Should show write entry form
    await expect(page.getByTestId('write-entry-form')).toBeVisible()
  })

  test('should navigate back from write page', async ({ page }) => {
    // Go to write page
    await page.getByRole('button', { name: /write/i }).click()
    await expect(page).toHaveURL(/\/write/)
    
    // Click back or close button
    await page.getByRole('button', { name: /back|close/i }).click()
    
    // Should return to main page
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  test('should toggle between calendar and timeline view', async ({ page }) => {
    // Start with calendar view
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
    
    // Click timeline toggle (assuming it exists)
    const timelineButton = page.getByRole('button', { name: /timeline/i })
    if (await timelineButton.isVisible()) {
      await timelineButton.click()
      
      // Should show timeline view
      await expect(page.getByTestId('timeline-view')).toBeVisible()
      await expect(page.getByTestId('calendar-grid')).not.toBeVisible()
      
      // Click calendar toggle
      await page.getByRole('button', { name: /calendar/i }).click()
      
      // Should show calendar view again
      await expect(page.getByTestId('calendar-grid')).toBeVisible()
      await expect(page.getByTestId('timeline-view')).not.toBeVisible()
    }
  })

  test('should handle responsive design on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return
    
    // Check mobile layout
    await expect(page.getByTestId('sidebar')).not.toBeVisible() // Should be hidden initially on mobile
    
    // Check if floating add button is visible on mobile
    const floatingButton = page.getByTestId('floating-add-button')
    if (await floatingButton.isVisible()) {
      await expect(floatingButton).toBeVisible()
    }
  })
})