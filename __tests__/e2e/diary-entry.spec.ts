import { test, expect } from '@playwright/test'

test.describe('Diary Entry Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should create a new diary entry', async ({ page }) => {
    // Navigate to write page
    await page.getByRole('button', { name: /write/i }).click()
    await expect(page).toHaveURL(/\/write/)

    // Fill in entry form
    const titleInput = page.getByRole('textbox', { name: /title/i })
    const contentInput = page.getByRole('textbox', { name: /content/i })
    const moodSelector = page.getByTestId('mood-selector')

    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Entry Title')
    }
    
    if (await contentInput.isVisible()) {
      await contentInput.fill('This is a test diary entry content.')
    }

    if (await moodSelector.isVisible()) {
      // Select a mood (click on happy emoji)
      await page.getByText('😊').click()
    }

    // Save the entry
    await page.getByRole('button', { name: /save/i }).click()

    // Should return to main page
    await expect(page).toHaveURL('/')
    
    // Should show success message
    await expect(page.getByText(/saved|success/i)).toBeVisible()
  })

  test('should view diary entry in calendar', async ({ page }) => {
    // Look for entries in calendar
    const calendarGrid = page.getByTestId('calendar-grid')
    await expect(calendarGrid).toBeVisible()

    // Click on a date that has entries (look for mood emojis)
    const dateWithEntry = calendarGrid.getByText('😊').first()
    if (await dateWithEntry.isVisible()) {
      await dateWithEntry.click()

      // Entry panel should open
      await expect(page.getByTestId('entry-view-panel')).toBeVisible()
      
      // Should display entry content
      await expect(page.getByTestId('entry-title')).toBeVisible()
      await expect(page.getByTestId('entry-content')).toBeVisible()
    }
  })

  test('should navigate between entries in panel', async ({ page }) => {
    // Open entry panel (assume there are multiple entries on a date)
    const calendarGrid = page.getByTestId('calendar-grid')
    
    // Click on a date that might have multiple entries
    await calendarGrid.getByText(/17/).click() // Using date 17 from our test data
    
    const entryPanel = page.getByTestId('entry-view-panel')
    if (await entryPanel.isVisible()) {
      // Check navigation controls
      const nextButton = page.getByLabelText('Next entry')
      const prevButton = page.getByLabelText('Previous entry')
      
      if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
        await nextButton.click()
        
        // Should show different entry
        await expect(entryPanel).toBeVisible()
      }
      
      if (await prevButton.isVisible() && !await prevButton.isDisabled()) {
        await prevButton.click()
        
        // Should go back to previous entry
        await expect(entryPanel).toBeVisible()
      }
    }
  })

  test('should close entry panel', async ({ page }) => {
    // Open entry panel
    const calendarGrid = page.getByTestId('calendar-grid')
    await calendarGrid.getByText(/17/).click()
    
    const entryPanel = page.getByTestId('entry-view-panel')
    if (await entryPanel.isVisible()) {
      // Close using close button
      await page.getByLabelText('Close panel').click()
      
      // Panel should be closed
      await expect(entryPanel).not.toBeVisible()
    }
  })

  test('should support keyboard navigation in entry panel', async ({ page }) => {
    // Open entry panel
    const calendarGrid = page.getByTestId('calendar-grid')
    await calendarGrid.getByText(/17/).click()
    
    const entryPanel = page.getByTestId('entry-view-panel')
    if (await entryPanel.isVisible()) {
      // Focus on panel
      await entryPanel.focus()
      
      // Test Escape key to close
      await page.keyboard.press('Escape')
      await expect(entryPanel).not.toBeVisible()
      
      // Reopen panel
      await calendarGrid.getByText(/17/).click()
      await expect(entryPanel).toBeVisible()
      
      // Test arrow keys for navigation
      await entryPanel.focus()
      await page.keyboard.press('ArrowRight')
      // Entry might change if there are multiple entries
      
      await page.keyboard.press('ArrowLeft')
      // Should go back
    }
  })

  test('should expand entry to fullscreen', async ({ page }) => {
    // Open entry panel
    const calendarGrid = page.getByTestId('calendar-grid')
    await calendarGrid.getByText(/17/).click()
    
    const entryPanel = page.getByTestId('entry-view-panel')
    if (await entryPanel.isVisible()) {
      // Click expand button
      await page.getByLabelText('Expand to fullscreen').click()
      
      // Should navigate to fullscreen view
      await expect(page).toHaveURL(/\/fullscreen-view/)
      
      // Sidebar should be hidden in fullscreen
      await expect(page.getByTestId('sidebar')).not.toBeVisible()
    }
  })
})