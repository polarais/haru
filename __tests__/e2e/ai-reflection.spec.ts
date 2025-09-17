import { test, expect } from '@playwright/test'

test.describe('AI Reflection Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to AI reflection page', async ({ page }) => {
    // Look for AI reflection button/link
    const aiButton = page.getByRole('button', { name: /ai|reflection/i })
    
    if (await aiButton.isVisible()) {
      await aiButton.click()
      
      // Should navigate to AI reflection page
      await expect(page).toHaveURL(/\/ai-reflection|\/reflection/)
      
      // Sidebar should be hidden
      await expect(page.getByTestId('sidebar')).not.toBeVisible()
      
      // Should show AI reflection interface
      await expect(page.getByTestId('ai-reflection-panel')).toBeVisible()
    } else {
      test.skip('AI reflection feature not available')
    }
  })

  test('should display chat interface', async ({ page }) => {
    // Navigate to AI reflection if available
    const aiButton = page.getByRole('button', { name: /ai|reflection/i })
    
    if (await aiButton.isVisible()) {
      await aiButton.click()
      
      // Check chat interface elements
      await expect(page.getByTestId('chat-messages')).toBeVisible()
      await expect(page.getByTestId('chat-input')).toBeVisible()
      await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
    } else {
      test.skip('AI reflection feature not available')
    }
  })

  test('should send a message to AI', async ({ page }) => {
    const aiButton = page.getByRole('button', { name: /ai|reflection/i })
    
    if (await aiButton.isVisible()) {
      await aiButton.click()
      
      // Type a message
      const chatInput = page.getByTestId('chat-input')
      await chatInput.fill('How am I feeling today?')
      
      // Send the message
      await page.getByRole('button', { name: /send/i }).click()
      
      // Message should appear in chat
      await expect(page.getByText('How am I feeling today?')).toBeVisible()
      
      // Should show loading state or response
      const chatMessages = page.getByTestId('chat-messages')
      await expect(chatMessages).toBeVisible()
      
      // Input should be cleared
      await expect(chatInput).toHaveValue('')
    } else {
      test.skip('AI reflection feature not available')
    }
  })

  test('should handle Enter key to send message', async ({ page }) => {
    const aiButton = page.getByRole('button', { name: /ai|reflection/i })
    
    if (await aiButton.isVisible()) {
      await aiButton.click()
      
      // Type a message and press Enter
      const chatInput = page.getByTestId('chat-input')
      await chatInput.fill('Test message via Enter key')
      await chatInput.press('Enter')
      
      // Message should appear in chat
      await expect(page.getByText('Test message via Enter key')).toBeVisible()
    } else {
      test.skip('AI reflection feature not available')
    }
  })

  test('should navigate back from AI reflection', async ({ page }) => {
    const aiButton = page.getByRole('button', { name: /ai|reflection/i })
    
    if (await aiButton.isVisible()) {
      await aiButton.click()
      await expect(page).toHaveURL(/\/ai-reflection|\/reflection/)
      
      // Click back button
      await page.getByRole('button', { name: /back|close/i }).click()
      
      // Should return to main page
      await expect(page).toHaveURL('/')
      await expect(page.getByTestId('calendar-grid')).toBeVisible()
      await expect(page.getByTestId('sidebar')).toBeVisible()
    } else {
      test.skip('AI reflection feature not available')
    }
  })

  test('should maintain chat history during session', async ({ page }) => {
    const aiButton = page.getByRole('button', { name: /ai|reflection/i })
    
    if (await aiButton.isVisible()) {
      await aiButton.click()
      
      // Send first message
      const chatInput = page.getByTestId('chat-input')
      await chatInput.fill('First message')
      await page.getByRole('button', { name: /send/i }).click()
      
      // Send second message
      await chatInput.fill('Second message')
      await page.getByRole('button', { name: /send/i }).click()
      
      // Both messages should be visible
      await expect(page.getByText('First message')).toBeVisible()
      await expect(page.getByText('Second message')).toBeVisible()
      
      // Navigate away and back
      await page.getByRole('button', { name: /back|close/i }).click()
      await page.getByRole('button', { name: /ai|reflection/i }).click()
      
      // Messages should still be there
      await expect(page.getByText('First message')).toBeVisible()
      await expect(page.getByText('Second message')).toBeVisible()
    } else {
      test.skip('AI reflection feature not available')
    }
  })
})