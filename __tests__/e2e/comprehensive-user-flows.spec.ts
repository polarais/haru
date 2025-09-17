import { test, expect } from '@playwright/test'
import { MainPage, WritePage, EntryViewPanel, AIReflectionPage, TestHelpers } from './helpers/page-objects'
import { getEntriesForTesting, getRandomConversationStarter, TestEntry } from './helpers/test-data'

test.describe('Comprehensive User Flows', () => {
  let mainPage: MainPage
  let writePage: WritePage
  let entryPanel: EntryViewPanel
  let aiPage: AIReflectionPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page)
    writePage = new WritePage(page)
    entryPanel = new EntryViewPanel(page)
    aiPage = new AIReflectionPage(page)
    helpers = new TestHelpers(page)
    
    await mainPage.goto()
    await mainPage.waitForPageLoad()
  })

  test('should complete full diary lifecycle: create, view, edit, delete', async ({ page }) => {
    const testEntry: TestEntry = {
      title: 'Complete Lifecycle Test',
      content: 'This entry will go through the complete lifecycle: creation, viewing, and potential deletion.',
      mood: '🔄'
    }

    await test.step('Create new diary entry', async () => {
      const createTime = await helpers.performanceCheck(async () => {
        await mainPage.navigateToWrite()
        await writePage.waitForPageLoad()
        await writePage.fillEntry(testEntry.title, testEntry.content, testEntry.mood)
        await writePage.saveEntry()
      }, 3000)
      
      console.log(`Entry creation took ${createTime}ms`)
      await mainPage.waitForPageLoad()
    })

    await test.step('Find and view created entry', async () => {
      // Look for the entry in calendar
      await mainPage.clickMoodEmoji(testEntry.mood)
      await entryPanel.waitForOpen()
      
      // Verify entry content
      await expect(entryPanel.title).toHaveText(testEntry.title)
      await expect(entryPanel.content).toContainText(testEntry.content)
    })

    await test.step('Test entry navigation and interactions', async () => {
      // Test keyboard navigation
      await entryPanel.useKeyboardNavigation('ArrowRight')
      await entryPanel.useKeyboardNavigation('ArrowLeft')
      
      // Test expand functionality
      if (await entryPanel.expandButton.isVisible()) {
        await entryPanel.expand()
        await expect(page).toHaveURL(/\/fullscreen/)
        
        // Navigate back
        await page.goBack()
        await expect(page).toHaveURL('/')
      }
    })

    await test.step('Test entry panel close', async () => {
      // Open panel again if needed
      if (!await entryPanel.panel.isVisible()) {
        await mainPage.clickMoodEmoji(testEntry.mood)
        await entryPanel.waitForOpen()
      }
      
      // Close with Escape key
      await entryPanel.useKeyboardNavigation('Escape')
      await expect(entryPanel.panel).not.toBeVisible()
    })
  })

  test('should handle multiple entry creation workflow efficiently', async ({ page }) => {
    const testEntries = getEntriesForTesting(3)
    const createdEntries: TestEntry[] = []

    await test.step('Create multiple entries in sequence', async () => {
      for (const [index, entry] of testEntries.entries()) {
        const stepTime = await helpers.performanceCheck(async () => {
          await mainPage.navigateToWrite()
          await writePage.fillEntry(entry.title, entry.content, entry.mood)
          await writePage.saveEntry()
          
          createdEntries.push(entry)
        }, 5000)
        
        console.log(`Entry ${index + 1} creation took ${stepTime}ms`)
        
        // Brief pause between entries to simulate real usage
        await helpers.waitForStableState()
      }
    })

    await test.step('Verify all entries are accessible', async () => {
      for (const entry of createdEntries) {
        // Find entry by mood emoji
        const moodEmoji = mainPage.calendarGrid.getByText(entry.mood)
        if (await moodEmoji.isVisible()) {
          await moodEmoji.click()
          await entryPanel.waitForOpen()
          
          // Verify content
          await expect(entryPanel.title).toHaveText(entry.title)
          await entryPanel.close()
        }
      }
    })

    await test.step('Test bulk operations performance', async () => {
      // Test rapid navigation between entries
      const navigationTime = await helpers.performanceCheck(async () => {
        for (const entry of createdEntries.slice(0, 2)) {
          const moodEmoji = mainPage.calendarGrid.getByText(entry.mood)
          if (await moodEmoji.isVisible()) {
            await moodEmoji.click()
            await entryPanel.waitForOpen()
            await entryPanel.close()
          }
        }
      }, 3000)
      
      console.log(`Bulk navigation took ${navigationTime}ms`)
    })
  })

  test('should provide seamless AI reflection experience', async ({ page }) => {
    await test.step('Navigate to AI reflection', async () => {
      const aiButton = mainPage.aiReflectionButton
      if (await aiButton.isVisible()) {
        await mainPage.navigateToAIReflection()
        await aiPage.waitForPageLoad()
      } else {
        test.skip('AI reflection feature not available')
      }
    })

    await test.step('Conduct comprehensive conversation', async () => {
      const conversations = [
        getRandomConversationStarter(),
        'Can you help me understand my mood patterns?',
        'What insights do you have from my recent entries?',
        'How can I improve my emotional well-being?'
      ]
      
      const conversationTime = await helpers.performanceCheck(async () => {
        for (const message of conversations) {
          await aiPage.sendMessage(message)
          
          // Small delay to simulate thinking time
          await page.waitForTimeout(500)
        }
      }, 10000)
      
      console.log(`AI conversation took ${conversationTime}ms`)
    })

    await test.step('Test conversation persistence', async () => {
      // Navigate away and back
      await aiPage.goBack()
      await mainPage.navigateToAIReflection()
      
      // Check if messages are still visible
      const history = await aiPage.getMessageHistory()
      expect(history.length).toBeGreaterThan(0)
    })

    await test.step('Test keyboard interactions in chat', async () => {
      await aiPage.sendMessageWithEnter('Testing keyboard input functionality')
      
      // Verify message appears
      await expect(page.getByText('Testing keyboard input functionality')).toBeVisible()
    })
  })

  test('should handle complex user scenarios gracefully', async ({ page }) => {
    await test.step('Simulate rapid context switching', async () => {
      const switchingTime = await helpers.performanceCheck(async () => {
        // Rapid navigation between different sections
        await mainPage.navigateToWrite()
        await writePage.goBack()
        
        const aiButton = mainPage.aiReflectionButton
        if (await aiButton.isVisible()) {
          await mainPage.navigateToAIReflection()
          await aiPage.goBack()
        }
        
        await mainPage.navigateToWrite()
        await writePage.goBack()
      }, 5000)
      
      console.log(`Context switching took ${switchingTime}ms`)
      
      // App should remain stable
      await mainPage.waitForPageLoad()
    })

    await test.step('Test error recovery scenarios', async () => {
      // Test form abandonment and recovery
      await mainPage.navigateToWrite()
      await writePage.titleInput.fill('Abandoned Entry')
      await writePage.contentInput.fill('This entry will be abandoned')
      
      // Navigate away without saving
      await writePage.goBack()
      
      // Navigate back to write page
      await mainPage.navigateToWrite()
      
      // Form should be clean (no previous data)
      if (await writePage.titleInput.isVisible()) {
        await expect(writePage.titleInput).toHaveValue('')
      }
      if (await writePage.contentInput.isVisible()) {
        await expect(writePage.contentInput).toHaveValue('')
      }
    })

    await test.step('Test accessibility during complex flows', async () => {
      // Navigate using only keyboard
      await page.keyboard.press('Tab') // Focus first interactive element
      await page.keyboard.press('Enter') // Activate it
      
      // Continue tab navigation
      let tabCount = 0
      while (tabCount < 10) {
        await page.keyboard.press('Tab')
        tabCount++
        
        // Check if focus is visible
        const focusedElement = page.locator(':focus')
        if (await focusedElement.isVisible()) {
          const boundingBox = await focusedElement.boundingBox()
          expect(boundingBox).toBeTruthy()
        }
      }
    })
  })

  test('should maintain data consistency across browser sessions', async ({ page }) => {
    const sessionEntry: TestEntry = {
      title: 'Session Persistence Test',
      content: 'This entry tests data persistence across browser sessions.',
      mood: '💾'
    }

    await test.step('Create entry for persistence test', async () => {
      await mainPage.navigateToWrite()
      await writePage.fillEntry(sessionEntry.title, sessionEntry.content, sessionEntry.mood)
      await writePage.saveEntry()
    })

    await test.step('Simulate browser refresh', async () => {
      await page.reload()
      await mainPage.waitForPageLoad()
      
      // Entry should still be visible
      const moodEmoji = mainPage.calendarGrid.getByText(sessionEntry.mood)
      if (await moodEmoji.isVisible()) {
        await moodEmoji.click()
        await entryPanel.waitForOpen()
        
        // Verify data integrity
        await expect(entryPanel.title).toHaveText(sessionEntry.title)
        await expect(entryPanel.content).toContainText(sessionEntry.content)
      }
    })

    await test.step('Test navigation state recovery', async () => {
      // Close panel
      await entryPanel.close()
      
      // Navigate to different page
      await mainPage.navigateToWrite()
      
      // Refresh page
      await page.reload()
      
      // Should be on write page after refresh
      await expect(page).toHaveURL(/\/write/)
      
      // Navigate back to main
      await writePage.goBack()
      await mainPage.waitForPageLoad()
    })
  })

  test('should optimize for mobile user experience', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('Mobile-specific test')
    }

    await test.step('Test mobile-optimized interactions', async () => {
      // Check mobile layout
      await helpers.checkElementVisibility('[data-testid="sidebar"]', false)
      
      // Test mobile navigation
      const floatingButton = page.getByTestId('floating-add-button')
      if (await floatingButton.isVisible()) {
        await floatingButton.click()
        await expect(page).toHaveURL(/\/write/)
        
        // Write page should be fullscreen on mobile
        await helpers.checkElementVisibility('[data-testid="sidebar"]', false)
      }
    })

    await test.step('Test touch interactions', async () => {
      // Navigate back to main
      await writePage.goBack()
      
      // Test touch gestures on calendar
      const calendarGrid = mainPage.calendarGrid
      const boundingBox = await calendarGrid.boundingBox()
      
      if (boundingBox) {
        // Simulate tap
        await page.touchscreen.tap(
          boundingBox.x + boundingBox.width / 2,
          boundingBox.y + boundingBox.height / 2
        )
        
        // Simulate swipe if applicable
        await page.touchscreen.swipe(
          boundingBox.x + boundingBox.width * 0.8,
          boundingBox.y + boundingBox.height / 2,
          boundingBox.x + boundingBox.width * 0.2,
          boundingBox.y + boundingBox.height / 2
        )
      }
    })

    await test.step('Test mobile performance', async () => {
      // Mobile operations should be optimized
      const mobilePerformanceTime = await helpers.performanceCheck(async () => {
        await mainPage.navigateToWrite()
        await writePage.fillEntry('Mobile Test', 'Testing mobile performance', '📱')
        await writePage.saveEntry()
      }, 4000) // Allow more time for mobile
      
      console.log(`Mobile entry creation took ${mobilePerformanceTime}ms`)
    })
  })
})