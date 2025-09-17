import { Page, Locator, expect } from '@playwright/test'

export class MainPage {
  readonly page: Page
  readonly calendarGrid: Locator
  readonly sidebar: Locator
  readonly writeButton: Locator
  readonly aiReflectionButton: Locator

  constructor(page: Page) {
    this.page = page
    this.calendarGrid = page.getByTestId('calendar-grid')
    this.sidebar = page.getByTestId('sidebar')
    this.writeButton = page.getByRole('button', { name: /write|작성/i })
    this.aiReflectionButton = page.getByRole('button', { name: /ai|reflection|리플렉션/i })
  }

  async goto() {
    await this.page.goto('/')
  }

  async navigateToWrite() {
    await this.writeButton.click()
    await this.page.waitForURL(/\/write/)
  }

  async navigateToAIReflection() {
    if (await this.aiReflectionButton.isVisible()) {
      await this.aiReflectionButton.click()
      await this.page.waitForURL(/\/ai-reflection|\/reflection/)
    }
  }

  async clickDate(date: string | number) {
    const dateElement = this.calendarGrid.getByText(date.toString())
    await dateElement.click()
  }

  async clickMoodEmoji(emoji: string) {
    const emojiElement = this.calendarGrid.getByText(emoji)
    await emojiElement.click()
  }

  async waitForPageLoad() {
    await expect(this.calendarGrid).toBeVisible()
    await expect(this.sidebar).toBeVisible()
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/${name}.png`,
      fullPage: true
    })
  }
}

export class WritePage {
  readonly page: Page
  readonly titleInput: Locator
  readonly contentInput: Locator
  readonly moodSelector: Locator
  readonly saveButton: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.titleInput = page.getByRole('textbox', { name: /title|제목/i })
    this.contentInput = page.getByRole('textbox', { name: /content|내용/i })
    this.moodSelector = page.getByTestId('mood-selector')
    this.saveButton = page.getByRole('button', { name: /save|저장/i })
    this.backButton = page.getByRole('button', { name: /back|close|뒤로/i })
  }

  async fillEntry(title: string, content: string, mood?: string) {
    if (await this.titleInput.isVisible()) {
      await this.titleInput.fill(title)
    }
    
    if (await this.contentInput.isVisible()) {
      await this.contentInput.fill(content)
    }
    
    if (mood && await this.moodSelector.isVisible()) {
      await this.page.getByText(mood).click()
    }
  }

  async saveEntry() {
    await this.saveButton.click()
    await this.page.waitForURL('/')
  }

  async goBack() {
    await this.backButton.click()
    await this.page.waitForURL('/')
  }

  async waitForPageLoad() {
    await this.page.waitForURL(/\/write/)
    await expect(this.page.getByTestId('sidebar')).not.toBeVisible()
  }
}

export class EntryViewPanel {
  readonly page: Page
  readonly panel: Locator
  readonly title: Locator
  readonly content: Locator
  readonly closeButton: Locator
  readonly expandButton: Locator
  readonly deleteButton: Locator
  readonly nextButton: Locator
  readonly prevButton: Locator
  readonly navigationInfo: Locator

  constructor(page: Page) {
    this.page = page
    this.panel = page.getByTestId('entry-view-panel')
    this.title = page.getByTestId('entry-title')
    this.content = page.getByTestId('entry-content')
    this.closeButton = page.getByLabelText('Close panel')
    this.expandButton = page.getByLabelText('Expand to fullscreen')
    this.deleteButton = page.getByLabelText('Delete entry')
    this.nextButton = page.getByLabelText('Next entry')
    this.prevButton = page.getByLabelText('Previous entry')
    this.navigationInfo = page.getByText(/\d+ \/ \d+/)
  }

  async waitForOpen() {
    await expect(this.panel).toBeVisible()
  }

  async close() {
    await this.closeButton.click()
    await expect(this.panel).not.toBeVisible()
  }

  async expand() {
    await this.expandButton.click()
    await this.page.waitForURL(/\/fullscreen/)
  }

  async navigateNext() {
    if (await this.nextButton.isVisible() && !await this.nextButton.isDisabled()) {
      await this.nextButton.click()
    }
  }

  async navigatePrevious() {
    if (await this.prevButton.isVisible() && !await this.prevButton.isDisabled()) {
      await this.prevButton.click()
    }
  }

  async delete() {
    await this.deleteButton.click()
  }

  async useKeyboardNavigation(key: 'Escape' | 'ArrowLeft' | 'ArrowRight') {
    await this.panel.focus()
    await this.page.keyboard.press(key)
  }

  async getNavigationInfo(): Promise<string | null> {
    if (await this.navigationInfo.isVisible()) {
      return await this.navigationInfo.textContent()
    }
    return null
  }
}

export class AIReflectionPage {
  readonly page: Page
  readonly chatMessages: Locator
  readonly chatInput: Locator
  readonly sendButton: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.chatMessages = page.getByTestId('chat-messages')
    this.chatInput = page.getByTestId('chat-input')
    this.sendButton = page.getByRole('button', { name: /send|전송/i })
    this.backButton = page.getByRole('button', { name: /back|close|뒤로/i })
  }

  async waitForPageLoad() {
    await this.page.waitForURL(/\/ai-reflection|\/reflection/)
    await expect(this.page.getByTestId('sidebar')).not.toBeVisible()
    await expect(this.chatMessages).toBeVisible()
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message)
    await this.sendButton.click()
    
    // Verify message appears
    await expect(this.page.getByText(message)).toBeVisible()
    
    // Input should be cleared
    await expect(this.chatInput).toHaveValue('')
  }

  async sendMessageWithEnter(message: string) {
    await this.chatInput.fill(message)
    await this.chatInput.press('Enter')
    
    // Verify message appears
    await expect(this.page.getByText(message)).toBeVisible()
  }

  async goBack() {
    await this.backButton.click()
    await this.page.waitForURL('/')
  }

  async getMessageHistory(): Promise<string[]> {
    const messages = await this.chatMessages.locator('.message').all()
    const messageTexts: string[] = []
    
    for (const message of messages) {
      const text = await message.textContent()
      if (text) {
        messageTexts.push(text)
      }
    }
    
    return messageTexts
  }
}

// Utility class for common test operations
export class TestHelpers {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async waitForStableState() {
    // Wait for any animations or transitions to complete
    await this.page.waitForTimeout(500)
    await this.page.waitForLoadState('networkidle')
  }

  async performanceCheck(operation: () => Promise<void>, maxTime: number = 2000) {
    const startTime = Date.now()
    await operation()
    const duration = Date.now() - startTime
    
    if (duration > maxTime) {
      throw new Error(`Operation took ${duration}ms, expected less than ${maxTime}ms`)
    }
    
    return duration
  }

  async checkElementVisibility(selector: string, shouldBeVisible: boolean = true) {
    const element = this.page.locator(selector)
    if (shouldBeVisible) {
      await expect(element).toBeVisible()
    } else {
      await expect(element).not.toBeVisible()
    }
  }

  async simulateSlowNetwork() {
    // Simulate slow 3G connection
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), 300)
    })
  }

  async clearNetworkThrottling() {
    await this.page.unroute('**/*')
  }

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.page.waitForLoadState('domcontentloaded')
    return Date.now() - startTime
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const buttons = this.page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        
        // Every button should have accessible text
        if (!ariaLabel && !textContent?.trim()) {
          throw new Error(`Button at index ${i} lacks accessible text`)
        }
      }
    }
  }
}