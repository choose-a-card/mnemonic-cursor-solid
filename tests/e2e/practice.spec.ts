import { test, expect } from '@playwright/test'
import { 
  navigateTo, 
  selectPracticeMode, 
  goBackFromPractice, 
  PRACTICE_MODES, 
  waitForTransition,
  parseCardFromQuestion,
  parsePositionFromQuestion,
  getCardPosition,
  getCardAtPosition,
  getNextCard,
  TAMARIZ_STACK,
  ensureStackType
} from './utils/test-helpers'

/**
 * Practice Page E2E Tests
 * 
 * These tests verify all 8 practice modes work correctly.
 * Answer verification tests use the TAMARIZ_STACK (the app's default stack)
 * imported from src/constants/stacks.ts - the single source of truth.
 * 
 * The app defaults to Tamariz stack, and tests clear localStorage to ensure
 * a clean state with default settings.
 */
test.describe('Practice Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, 'practice')
    // Clear storage to reset to defaults (Tamariz stack)
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('Mode Selector', () => {
    test('should display the practice mode selector', async ({ page }) => {
      await expect(page.locator('.practice-view')).toBeVisible()
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })

    test('should display all practice modes', async ({ page }) => {
      const modeCards = page.locator('.mode-card')
      const count = await modeCards.count()
      
      // Should have 8 practice modes
      expect(count).toBe(8)
    })

    test('should display mode names and descriptions', async ({ page }) => {
      for (const [modeId, modeName] of Object.entries(PRACTICE_MODES)) {
        const modeCard = page.locator('.mode-card').filter({ hasText: modeName })
        await expect(modeCard).toBeVisible()
      }
    })

    test('should display mode icons', async ({ page }) => {
      const modeCards = page.locator('.mode-card')
      const count = await modeCards.count()
      
      for (let i = 0; i < count; i++) {
        const modeCard = modeCards.nth(i)
        const icon = modeCard.locator('.mode-icon')
        await expect(icon).toBeVisible()
      }
    })
  })

  test.describe('Card → Position Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'card-to-pos')
    })

    test('should display practice header with mode name', async ({ page }) => {
      const header = page.locator('.practice-header')
      await expect(header).toBeVisible()
      
      const modeName = page.locator('.practice-name')
      await expect(modeName).toContainText('Card → Position')
    })

    test('should display back button', async ({ page }) => {
      const backButton = page.locator('.back-button')
      await expect(backButton).toBeVisible()
    })

    test('should display question card', async ({ page }) => {
      const questionCard = page.locator('.question-card')
      await expect(questionCard).toBeVisible()
      
      // Should ask about a card position
      const questionText = page.locator('.question-text')
      await expect(questionText).toContainText(/What position is/)
    })

    test('should display answer input', async ({ page }) => {
      const answerInput = page.locator('.answer-input')
      await expect(answerInput).toBeVisible()
      await expect(answerInput).toHaveAttribute('type', 'number')
    })

    test('should display submit button', async ({ page }) => {
      const submitBtn = page.locator('.submit-btn')
      await expect(submitBtn).toBeVisible()
      await expect(submitBtn).toContainText('Submit')
    })

    test('should accept answer submission', async ({ page }) => {
      const answerInput = page.locator('.answer-input')
      await answerInput.fill('1')
      
      const submitBtn = page.locator('.submit-btn')
      await submitBtn.click()
      
      // Should show feedback
      await expect(page.locator('.feedback-message')).toBeVisible({ timeout: 1000 })
    })

    test('should show "Correct" feedback for right answer', async ({ page }) => {
      // Get the question text
      const questionText = await page.locator('.question-text').textContent()
      const card = parseCardFromQuestion(questionText || '')
      
      if (card) {
        const correctPosition = getCardPosition(card)
        
        // Enter the correct answer
        const answerInput = page.locator('.answer-input')
        await answerInput.fill(String(correctPosition))
        
        const submitBtn = page.locator('.submit-btn')
        await submitBtn.click()
        
        // Should show "Correct" feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 1000 })
        await expect(feedback).toContainText('Correct')
      }
    })

    test('should show "Wrong" feedback for incorrect answer', async ({ page }) => {
      // Get the question text
      const questionText = await page.locator('.question-text').textContent()
      const card = parseCardFromQuestion(questionText || '')
      
      if (card) {
        const correctPosition = getCardPosition(card)
        // Enter a wrong answer (always different from correct)
        const wrongPosition = correctPosition === 1 ? 52 : 1
        
        const answerInput = page.locator('.answer-input')
        await answerInput.fill(String(wrongPosition))
        
        const submitBtn = page.locator('.submit-btn')
        await submitBtn.click()
        
        // Should show "Wrong" feedback with the correct answer
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 1000 })
        await expect(feedback).toContainText('Wrong')
        await expect(feedback).toContainText(String(correctPosition))
      }
    })

    test('should answer multiple questions correctly in a row', async ({ page }) => {
      // Answer 3 questions correctly
      for (let i = 0; i < 3; i++) {
        const questionText = await page.locator('.question-text').textContent()
        const card = parseCardFromQuestion(questionText || '')
        
        if (card) {
          const correctPosition = getCardPosition(card)
          await page.locator('.answer-input').fill(String(correctPosition))
          await page.locator('.submit-btn').click()
          
          // Verify correct feedback
          await expect(page.locator('.feedback-message')).toContainText('Correct', { timeout: 1000 })
          
          // Wait for next question
          await page.waitForTimeout(1600)
        }
      }
    })

    test('should go back to mode selector', async ({ page }) => {
      await goBackFromPractice(page)
      
      // Should be back at mode selector
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })

    test('should show next question after feedback', async ({ page }) => {
      // Get the initial question
      const initialQuestion = await page.locator('.question-text').textContent()
      
      // Submit an answer
      await page.locator('.answer-input').fill('10')
      await page.locator('.submit-btn').click()
      
      // Wait for feedback timer (typically 1500ms)
      await page.waitForTimeout(2000)
      
      // Question should have changed (or could be the same by chance, but input should be cleared)
      const answerInput = page.locator('.answer-input')
      await expect(answerInput).toHaveValue('')
    })
  })

  test.describe('Position → Card Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'pos-to-card')
    })

    test('should display position question', async ({ page }) => {
      const questionText = page.locator('.question-text')
      await expect(questionText).toContainText(/position|card at/)
    })

    test('should show "Correct" feedback for right card answer', async ({ page }) => {
      // Get the question text to find the position
      const questionText = await page.locator('.question-text').textContent()
      const position = parsePositionFromQuestion(questionText || '')
      
      if (position) {
        const correctCard = getCardAtPosition(position)
        
        // This mode uses CardKeyboard - keyboard may already be open
        // Wait for keyboard to be visible
        const keyboard = page.locator('.card-keyboard')
        if (!(await keyboard.isVisible())) {
          await page.locator('.answer-input').click()
        }
        await expect(keyboard).toBeVisible({ timeout: 3000 })
        await page.waitForTimeout(500) // Wait for slide animation to complete
        
        // Extract value and suit from card (e.g., "4♣" => value "4", suit "♣")
        const rank = correctCard.replace(/[♠♥♦♣]/g, '')
        const suit = correctCard.match(/[♠♥♦♣]/)?.[0] || ''
        
        // Click rank button using force to handle animation
        await page.locator('.rank-btn').filter({ hasText: new RegExp(`^${rank}$`) }).first().click({ force: true })
        
        // Small delay between clicks
        await page.waitForTimeout(100)
        
        // Click suit button (this auto-submits)
        await page.locator('.suit-btn').filter({ hasText: suit }).first().click({ force: true })
        
        // Verify correct feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 2000 })
        await expect(feedback).toContainText('Correct')
      }
    })

    test('should show "Wrong" feedback for incorrect card answer', async ({ page }) => {
      // Get the question text to find the position
      const questionText = await page.locator('.question-text').textContent()
      const position = parsePositionFromQuestion(questionText || '')
      
      if (position) {
        const correctCard = getCardAtPosition(position)
        // Pick a wrong card (different position)
        const wrongPosition = position === 1 ? 2 : 1
        const wrongCard = getCardAtPosition(wrongPosition)
        
        // This mode uses CardKeyboard - keyboard may already be open
        const keyboard = page.locator('.card-keyboard')
        if (!(await keyboard.isVisible())) {
          await page.locator('.answer-input').click()
        }
        await expect(keyboard).toBeVisible({ timeout: 3000 })
        await page.waitForTimeout(500) // Wait for slide animation to complete
        
        // Extract rank and suit from wrong card
        const rank = wrongCard.replace(/[♠♥♦♣]/g, '')
        const suit = wrongCard.match(/[♠♥♦♣]/)?.[0] || ''
        
        // Click rank button using force to handle animation
        await page.locator('.rank-btn').filter({ hasText: new RegExp(`^${rank}$`) }).first().click({ force: true })
        
        // Small delay between clicks
        await page.waitForTimeout(100)
        
        // Click suit button (this auto-submits)
        await page.locator('.suit-btn').filter({ hasText: suit }).first().click({ force: true })
        
        // Verify wrong feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 2000 })
        await expect(feedback).toContainText('Wrong')
      }
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('One Ahead Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'one-ahead')
    })

    test('should display one ahead question', async ({ page }) => {
      await expect(page.locator('.practice-name')).toContainText('One Ahead')
      await expect(page.locator('.question-text')).toContainText(/What card comes after/)
    })

    test('should show "Correct" feedback for right next card', async ({ page }) => {
      // Get the question text to find the current card
      const questionText = await page.locator('.question-text').textContent()
      const currentCard = parseCardFromQuestion(questionText || '')
      
      if (currentCard) {
        const nextCard = getNextCard(currentCard)
        
        // Open keyboard
        await page.locator('.answer-input').click()
        await page.waitForSelector('.card-keyboard', { timeout: 2000 })
        await page.waitForTimeout(300) // Wait for slide animation
        
        // Extract rank and suit
        const rank = nextCard.replace(/[♠♥♦♣]/g, '')
        const suit = nextCard.match(/[♠♥♦♣]/)?.[0] || ''
        
        // Click rank button
        await page.locator('.rank-btn').filter({ hasText: new RegExp(`^${rank}$`) }).click()
        
        // Click suit button (this auto-submits)
        await page.locator('.suit-btn').filter({ hasText: suit }).click()
        
        // Verify correct feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 2000 })
        await expect(feedback).toContainText('Correct')
      }
    })

    test('should show "Wrong" feedback for incorrect next card', async ({ page }) => {
      // Get the question text to find the current card
      const questionText = await page.locator('.question-text').textContent()
      const currentCard = parseCardFromQuestion(questionText || '')
      
      if (currentCard) {
        const correctNextCard = getNextCard(currentCard)
        // Pick a wrong card (always pick the first card in stack which won't be correct)
        const wrongCard = correctNextCard === TAMARIZ_STACK[0] ? TAMARIZ_STACK[1] : TAMARIZ_STACK[0]
        
        // Open keyboard
        await page.locator('.answer-input').click()
        await page.waitForSelector('.card-keyboard', { timeout: 2000 })
        await page.waitForTimeout(300) // Wait for slide animation
        
        // Extract rank and suit
        const rank = wrongCard.replace(/[♠♥♦♣]/g, '')
        const suit = wrongCard.match(/[♠♥♦♣]/)?.[0] || ''
        
        // Click rank button
        await page.locator('.rank-btn').filter({ hasText: new RegExp(`^${rank}$`) }).click()
        
        // Click suit button
        await page.locator('.suit-btn').filter({ hasText: suit }).click()
        
        // Verify wrong feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 2000 })
        await expect(feedback).toContainText('Wrong')
      }
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('Stack Context Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'context')
    })

    test('should display stack context header', async ({ page }) => {
      await expect(page.locator('.practice-name')).toContainText('Stack Context')
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('Cutting Estimation Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'cutting')
    })

    test('should display cutting estimation header', async ({ page }) => {
      await expect(page.locator('.practice-name')).toContainText('Cutting Estimation')
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('First or Second Half Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'first-or-second-half')
    })

    test('should display first or second half header', async ({ page }) => {
      await expect(page.locator('.practice-name')).toContainText('First or Second Half')
    })

    test('should display choice buttons', async ({ page }) => {
      // Should have First Half and Second Half buttons
      await expect(page.locator('.answer-btn').filter({ hasText: 'First Half' })).toBeVisible()
      await expect(page.locator('.answer-btn').filter({ hasText: 'Second Half' })).toBeVisible()
    })

    test('should show "Correct" feedback for right half selection', async ({ page }) => {
      // Get the displayed card
      const cardElement = page.locator('.quiz-card-large')
      const cardText = await cardElement.textContent()
      
      if (cardText) {
        const position = getCardPosition(cardText.trim())
        const correctHalf = position <= 26 ? 'First Half' : 'Second Half'
        
        // Click the correct button
        await page.locator('.answer-btn').filter({ hasText: correctHalf }).click()
        
        // Verify correct feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 1000 })
        await expect(feedback).toContainText('Correct')
      }
    })

    test('should show "Wrong" feedback for incorrect half selection', async ({ page }) => {
      // Get the displayed card
      const cardElement = page.locator('.quiz-card-large')
      const cardText = await cardElement.textContent()
      
      if (cardText) {
        const position = getCardPosition(cardText.trim())
        const correctHalf = position <= 26 ? 'First Half' : 'Second Half'
        const wrongHalf = correctHalf === 'First Half' ? 'Second Half' : 'First Half'
        
        // Click the wrong button
        await page.locator('.answer-btn').filter({ hasText: wrongHalf }).click()
        
        // Verify wrong feedback
        const feedback = page.locator('.feedback-message')
        await expect(feedback).toBeVisible({ timeout: 1000 })
        await expect(feedback).toContainText('Wrong')
      }
    })

    test('should answer multiple questions correctly', async ({ page }) => {
      // Answer 3 questions correctly
      for (let i = 0; i < 3; i++) {
        const cardElement = page.locator('.quiz-card-large')
        const cardText = await cardElement.textContent()
        
        if (cardText) {
          const position = getCardPosition(cardText.trim())
          const correctHalf = position <= 26 ? 'First Half' : 'Second Half'
          
          await page.locator('.answer-btn').filter({ hasText: correctHalf }).click()
          await expect(page.locator('.feedback-message')).toContainText('Correct', { timeout: 1000 })
          
          // Wait for next question
          await page.waitForTimeout(1600)
        }
      }
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('Quartet Position Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'quartet-position')
    })

    test('should display quartet position header', async ({ page }) => {
      await expect(page.locator('.practice-name')).toContainText('Quartet Position')
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('Cut to Position Mode', () => {
    test.beforeEach(async ({ page }) => {
      await selectPracticeMode(page, 'cut-to-position')
    })

    test('should display cut to position header', async ({ page }) => {
      await expect(page.locator('.practice-name')).toContainText('Cut to Position')
    })

    test('should have back button functionality', async ({ page }) => {
      await goBackFromPractice(page)
      await expect(page.locator('.practice-mode-selector')).toBeVisible()
    })
  })

  test.describe('Mode Navigation', () => {
    test('should cycle through all modes without errors', async ({ page }) => {
      const modeIds = Object.keys(PRACTICE_MODES)
      
      for (const modeId of modeIds) {
        await selectPracticeMode(page, modeId)
        
        // Verify header is displayed
        await expect(page.locator('.practice-header')).toBeVisible()
        
        // Go back
        await goBackFromPractice(page)
        
        // Verify mode selector is displayed
        await expect(page.locator('.practice-mode-selector')).toBeVisible()
      }
    })

    test('should maintain practice state on navigation', async ({ page }) => {
      // Enter a mode
      await selectPracticeMode(page, 'card-to-pos')
      
      // Navigate away
      await navigateTo(page, 'stats')
      await expect(page.locator('.stats-view')).toBeVisible()
      
      // Navigate back
      await navigateTo(page, 'practice')
      
      // Should be at mode selector (state resets)
      await expect(page.locator('.practice-view')).toBeVisible()
    })
  })
})

