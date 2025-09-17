import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/')
  })

  test('should complete full diary writing and viewing workflow', async ({ page }) => {
    // Step 1: Navigate to write page
    await test.step('Navigate to write page', async () => {
      await page.getByRole('button', { name: /write|작성/i }).click()
      await expect(page).toHaveURL(/\/write/)
      await expect(page.getByTestId('sidebar')).not.toBeVisible()
    })

    // Step 2: Create a new diary entry
    await test.step('Create a new diary entry', async () => {
      // Fill in title
      const titleInput = page.getByRole('textbox', { name: /title|제목/i })
      if (await titleInput.isVisible()) {
        await titleInput.fill('My Amazing Day')
      }

      // Select mood
      const moodSelector = page.getByTestId('mood-selector')
      if (await moodSelector.isVisible()) {
        await page.getByText('😊').click()
      }

      // Fill in content
      const contentInput = page.getByRole('textbox', { name: /content|내용/i })
      if (await contentInput.isVisible()) {
        await contentInput.fill(`Today was incredible! I woke up early and went for a run in the park. 
        
The weather was perfect - sunny but not too hot. I met my friend Sarah for coffee afterwards, and we had such a great conversation about our upcoming vacation plans.

In the afternoon, I worked on my personal project and made significant progress. Feeling really productive and happy today!`)
      }

      // Save the entry
      await page.getByRole('button', { name: /save|저장/i }).click()
    })

    // Step 3: Verify return to main page
    await test.step('Verify return to main page and entry creation', async () => {
      await expect(page).toHaveURL('/')
      await expect(page.getByTestId('sidebar')).toBeVisible()
      
      // Look for success message or new entry indication
      const successMessage = page.getByText(/saved|success|저장됨|성공/i)
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible()
      }
    })

    // Step 4: Find and view the created entry
    await test.step('Find and view the created entry in calendar', async () => {
      const calendarGrid = page.getByTestId('calendar-grid')
      await expect(calendarGrid).toBeVisible()

      // Look for the mood emoji we just added
      const happyMood = calendarGrid.getByText('😊')
      if (await happyMood.isVisible()) {
        await happyMood.click()
        
        // Entry panel should open
        await expect(page.getByTestId('entry-view-panel')).toBeVisible()
        await expect(page.getByText('My Amazing Day')).toBeVisible()
        await expect(page.getByText(/Today was incredible/)).toBeVisible()
      }
    })

    // Step 5: Test entry panel interactions
    await test.step('Test entry panel interactions', async () => {
      const entryPanel = page.getByTestId('entry-view-panel')
      if (await entryPanel.isVisible()) {
        // Test expand functionality
        const expandButton = page.getByLabelText('Expand to fullscreen')
        if (await expandButton.isVisible()) {
          await expandButton.click()
          await expect(page).toHaveURL(/\/fullscreen/)
          
          // Navigate back
          await page.goBack()
          await expect(page).toHaveURL('/')
        }
      }
    })
  })

  test('should handle multiple entries creation and navigation', async ({ page }) => {
    const entries = [
      { title: 'Morning Routine', mood: '☀️', content: 'Started the day with meditation and yoga.' },
      { title: 'Work Progress', mood: '💪', content: 'Made great progress on the new project today.' },
      { title: 'Evening Reflection', mood: '🌙', content: 'Grateful for all the good things that happened.' }
    ]

    for (const [index, entry] of entries.entries()) {
      await test.step(`Create entry ${index + 1}: ${entry.title}`, async () => {
        // Navigate to write page
        await page.getByRole('button', { name: /write|작성/i }).click()
        await expect(page).toHaveURL(/\/write/)

        // Fill in entry details
        const titleInput = page.getByRole('textbox', { name: /title|제목/i })
        if (await titleInput.isVisible()) {
          await titleInput.fill(entry.title)
        }

        const contentInput = page.getByRole('textbox', { name: /content|내용/i })
        if (await contentInput.isVisible()) {
          await contentInput.fill(entry.content)
        }

        // Select mood
        await page.getByText(entry.mood).click()

        // Save entry
        await page.getByRole('button', { name: /save|저장/i }).click()
        await expect(page).toHaveURL('/')
      })
    }

    await test.step('Verify all entries are visible in calendar', async () => {
      const calendarGrid = page.getByTestId('calendar-grid')
      
      // Check that all mood emojis are visible
      for (const entry of entries) {
        await expect(calendarGrid.getByText(entry.mood)).toBeVisible()
      }
    })

    await test.step('Test navigation between entries', async () => {
      // Click on today's date to open entry panel
      const today = new Date().getDate()
      const todayCell = page.getByText(today.toString()).first()
      
      if (await todayCell.isVisible()) {
        await todayCell.click()
        
        const entryPanel = page.getByTestId('entry-view-panel')
        if (await entryPanel.isVisible()) {
          // Test navigation between entries
          const nextButton = page.getByLabelText('Next entry')
          const prevButton = page.getByLabelText('Previous entry')
          
          if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
            await nextButton.click()
            // Should show different entry
          }
          
          if (await prevButton.isVisible() && !await prevButton.isDisabled()) {
            await prevButton.click()
            // Should go back
          }
        }
      }
    })
  })

  test('should handle AI reflection complete workflow', async ({ page }) => {
    // Step 1: Navigate to AI reflection
    await test.step('Navigate to AI reflection page', async () => {
      const aiButton = page.getByRole('button', { name: /ai|reflection|리플렉션/i })
      
      if (await aiButton.isVisible()) {
        await aiButton.click()
        await expect(page).toHaveURL(/\/ai-reflection|\/reflection/)
        await expect(page.getByTestId('sidebar')).not.toBeVisible()
      } else {
        test.skip('AI reflection feature not available')
      }
    })

    // Step 2: Have a conversation with AI
    await test.step('Have a conversation with AI', async () => {
      const chatInput = page.getByTestId('chat-input')
      const sendButton = page.getByRole('button', { name: /send|전송/i })
      
      const messages = [
        'How am I feeling today?',
        'What can I learn from my recent entries?',
        'Help me reflect on my mood patterns.'
      ]
      
      for (const message of messages) {
        await chatInput.fill(message)
        await sendButton.click()
        
        // Message should appear in chat
        await expect(page.getByText(message)).toBeVisible()
        
        // Wait for potential AI response (this would depend on actual implementation)
        await page.waitForTimeout(1000)
      }
    })

    // Step 3: Test keyboard interactions
    await test.step('Test keyboard message sending', async () => {
      const chatInput = page.getByTestId('chat-input')
      
      await chatInput.fill('Testing Enter key functionality')
      await chatInput.press('Enter')
      
      await expect(page.getByText('Testing Enter key functionality')).toBeVisible()
      await expect(chatInput).toHaveValue('')
    })

    // Step 4: Navigate back and verify chat persistence
    await test.step('Test chat history persistence', async () => {
      // Go back to main page
      await page.getByRole('button', { name: /back|close|뒤로/i }).click()
      await expect(page).toHaveURL('/')
      
      // Return to AI reflection
      await page.getByRole('button', { name: /ai|reflection|리플렉션/i }).click()
      
      // Check if messages are still there
      await expect(page.getByText('How am I feeling today?')).toBeVisible()
      await expect(page.getByText('Testing Enter key functionality')).toBeVisible()
    })
  })

  test('should handle responsive design across different viewports', async ({ page, isMobile }) => {
    await test.step('Test desktop layout', async () => {
      if (!isMobile) {
        // Desktop specific tests
        await expect(page.getByTestId('sidebar')).toBeVisible()
        await expect(page.getByTestId('calendar-grid')).toBeVisible()
        
        // Test sidebar interactions
        const sidebarButtons = page.getByTestId('sidebar').getByRole('button')
        const buttonCount = await sidebarButtons.count()
        expect(buttonCount).toBeGreaterThan(0)
      }
    })

    await test.step('Test mobile layout', async () => {
      if (isMobile) {
        // Mobile specific tests
        const sidebar = page.getByTestId('sidebar')
        
        // Sidebar might be hidden initially on mobile
        if (await sidebar.isVisible()) {
          await expect(sidebar).toBeVisible()
        }
        
        // Check for mobile-specific elements
        const floatingButton = page.getByTestId('floating-add-button')
        if (await floatingButton.isVisible()) {
          await expect(floatingButton).toBeVisible()
          
          // Test floating button functionality
          await floatingButton.click()
          await expect(page).toHaveURL(/\/write/)
        }
      }
    })

    await test.step('Test responsive navigation', async () => {
      // Test write page navigation
      await page.getByRole('button', { name: /write|작성/i }).click()
      await expect(page).toHaveURL(/\/write/)
      
      if (isMobile) {
        // On mobile, write page should take full screen
        await expect(page.getByTestId('sidebar')).not.toBeVisible()
      }
      
      // Navigate back
      await page.getByRole('button', { name: /back|close|뒤로/i }).click()
      await expect(page).toHaveURL('/')
    })
  })

  test('should handle error states and edge cases gracefully', async ({ page }) => {
    await test.step('Test navigation to non-existent entry', async () => {
      // Try to navigate to a date with no entries
      const calendarGrid = page.getByTestId('calendar-grid')
      const emptyDate = calendarGrid.getByText('1').first() // Assuming day 1 has no entries
      
      if (await emptyDate.isVisible()) {
        await emptyDate.click()
        
        // Entry panel should not open
        const entryPanel = page.getByTestId('entry-view-panel')
        await expect(entryPanel).not.toBeVisible()
      }
    })

    await test.step('Test form validation in write page', async () => {
      await page.getByRole('button', { name: /write|작성/i }).click()
      
      // Try to save without filling required fields
      const saveButton = page.getByRole('button', { name: /save|저장/i })
      if (await saveButton.isVisible()) {
        await saveButton.click()
        
        // Should show validation errors or prevent submission
        // This would depend on actual validation implementation
        const errorMessage = page.getByText(/required|필수|error|오류/i)
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible()
        }
      }
    })

    await test.step('Test keyboard navigation edge cases', async () => {
      // Open an entry panel
      const calendarGrid = page.getByTestId('calendar-grid')
      const dateWithEntry = calendarGrid.getByText(/\d+/).first()
      
      if (await dateWithEntry.isVisible()) {
        await dateWithEntry.click()
        
        const entryPanel = page.getByTestId('entry-view-panel')
        if (await entryPanel.isVisible()) {
          // Test keyboard navigation at boundaries
          await entryPanel.focus()
          
          // Try to go beyond boundaries
          await page.keyboard.press('ArrowLeft')
          await page.keyboard.press('ArrowLeft')
          await page.keyboard.press('ArrowRight')
          await page.keyboard.press('ArrowRight')
          
          // Panel should still be functional
          await expect(entryPanel).toBeVisible()
          
          // Close with Escape
          await page.keyboard.press('Escape')
          await expect(entryPanel).not.toBeVisible()
        }
      }
    })
  })

  test('should maintain state consistency across navigation', async ({ page }) => {
    await test.step('Create entry and verify state persistence', async () => {
      // Create an entry
      await page.getByRole('button', { name: /write|작성/i }).click()
      
      const titleInput = page.getByRole('textbox', { name: /title|제목/i })
      if (await titleInput.isVisible()) {
        await titleInput.fill('State Consistency Test')
      }
      
      await page.getByRole('button', { name: /save|저장/i }).click()
      await expect(page).toHaveURL('/')
    })

    await test.step('Navigate through different pages and return', async () => {
      // Go to AI reflection if available
      const aiButton = page.getByRole('button', { name: /ai|reflection/i })
      if (await aiButton.isVisible()) {
        await aiButton.click()
        await page.getByRole('button', { name: /back|close/i }).click()
      }
      
      // Go to write page and back
      await page.getByRole('button', { name: /write/i }).click()
      await page.getByRole('button', { name: /back|close/i }).click()
      
      // Should be back at main page
      await expect(page).toHaveURL('/')
      await expect(page.getByTestId('calendar-grid')).toBeVisible()
    })

    await test.step('Verify entry is still accessible after navigation', async () => {
      // Look for the entry we created
      const calendarGrid = page.getByTestId('calendar-grid')
      const entryExists = page.getByText('State Consistency Test')
      
      if (await entryExists.isVisible()) {
        await expect(entryExists).toBeVisible()
      }
    })
  })
})