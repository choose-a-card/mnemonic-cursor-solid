import { test, expect, type Page } from '@playwright/test'
import { 
  navigateTo, 
  waitForTransition,
  selectPracticeMode,
  parseCardFromQuestion
} from './utils/test-helpers'
import { RANKS, SUITS } from '../../src/constants/cards'

/**
 * Custom Stacks E2E Tests
 * 
 * Highly optimized - creates only ONE 52-card stack across all tests
 */

// Generate test stack (reversed standard order for easy verification)
const generateTestStack = (): string[] => {
  const cards: string[] = []
  const reversedSuits = [...SUITS].reverse()
  const reversedRanks = [...RANKS].reverse()
  
  for (const suit of reversedSuits) {
    for (const rank of reversedRanks) {
      cards.push(`${rank}${suit.symbol}`)
    }
  }
  return cards
}

const TEST_STACK = generateTestStack()
const TEST_STACK_NAME = 'E2E Test Stack'

/** Helper to fill all 52 positions */
const fillStack = async (page: Page, cards: string[]): Promise<void> => {
  for (const card of cards) {
    const rank = card.replace(/[♠♥♦♣]/g, '')
    const suit = card.match(/[♠♥♦♣]/)?.[0] || ''
    const suitRow = page.locator('.suit-row').filter({ has: page.locator(`.suit-symbol:has-text("${suit}")`) })
    await suitRow.locator('.rank-btn').filter({ hasText: new RegExp(`^${rank}$`) }).click()
  }
}

/** Get card position in test stack (1-indexed) */
const getTestStackCardPosition = (card: string): number => TEST_STACK.indexOf(card) + 1

test.describe('Custom Stacks Feature', () => {
  
  /**
   * Test 1: UI Elements Only (no stack creation - fast)
   */
  test('should display correct UI elements', async ({ page }) => {
    await page.goto('/#/settings')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    
    // Verify Custom Stacks Card with empty state
    await expect(page.locator('.card').filter({ hasText: /Custom Stacks/i })).toBeVisible()
    await expect(page.locator('.empty-state')).toContainText(/No custom stacks/)
    
    // Open Stack Builder and verify UI
    await page.locator('button').filter({ hasText: /Create New Stack/i }).click()
    await expect(page.locator('.stack-builder-page')).toBeVisible()
    await expect(page.locator('.stack-name-input')).toBeVisible()
    await expect(page.locator('.progress-text')).toContainText('0 / 52')
    await expect(page.locator('.save-button')).toBeDisabled()
    
    // Verify all 4 suits
    for (const suit of SUITS) {
      await expect(page.locator('.suit-symbol').filter({ hasText: suit.symbol })).toBeVisible()
    }
    
    // Verify card selection updates progress and marks cards used
    const spadesRow = page.locator('.suit-row').filter({ has: page.locator('.suit-symbol:has-text("♠")') })
    await spadesRow.locator('.rank-btn').filter({ hasText: /^A$/ }).click()
    await expect(page.locator('.progress-text')).toContainText('1 / 52')
    await expect(page.locator('.rank-btn.used')).toHaveCount(1)
    
    // Verify Back button works
    await page.locator('.back-button').click()
    await expect(page.locator('.settings-view')).toBeVisible()
  })

  /**
   * Test 2: Complete Workflow (creates stack ONCE, tests everything)
   */
  test('should support full custom stack workflow: create, view, practice, edit, delete', async ({ page }) => {
    test.setTimeout(90000)
    
    await page.goto('/#/settings')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    
    // ========== CREATE STACK ==========
    await page.locator('button').filter({ hasText: /Create New Stack/i }).click()
    await page.locator('.stack-name-input').fill(TEST_STACK_NAME)
    await fillStack(page, TEST_STACK)
    await expect(page.locator('.progress-complete')).toBeVisible()
    await page.locator('.save-button').click()
    await expect(page.locator('.settings-view')).toBeVisible()
    
    // ========== VERIFY IN SETTINGS ==========
    const stackItem = page.locator('.stack-item').filter({ hasText: TEST_STACK_NAME })
    await expect(stackItem).toBeVisible()
    
    // Select the custom stack
    const customStackOption = page.locator('.stack-option.custom').filter({ hasText: TEST_STACK_NAME })
    await customStackOption.click()
    await expect(customStackOption).toHaveClass(/active/)
    
    // ========== VERIFY IN STACK VIEW ==========
    await navigateTo(page, 'stack')
    await expect(page.locator('.stack-title')).toContainText(TEST_STACK_NAME)
    
    // Verify first 3 cards match
    const cards = page.locator('.playing-card')
    for (let i = 0; i < 3; i++) {
      const expectedCard = TEST_STACK[i]
      const expectedRank = expectedCard.replace(/[♠♥♦♣]/g, '')
      const expectedSuit = expectedCard.match(/[♠♥♦♣]/)?.[0] || ''
      await expect(cards.nth(i).locator('.card-value')).toHaveText(expectedRank)
      await expect(cards.nth(i).locator('.card-suit')).toHaveText(expectedSuit)
    }
    
    // ========== PRACTICE WITH CUSTOM STACK ==========
    await navigateTo(page, 'practice')
    await selectPracticeMode(page, 'card-to-pos')
    
    // Answer 5 questions correctly
    for (let i = 0; i < 5; i++) {
      const questionText = await page.locator('.question-text').textContent()
      const card = parseCardFromQuestion(questionText || '')
      if (card) {
        await page.locator('.answer-input').fill(String(getTestStackCardPosition(card)))
        await page.locator('.submit-btn').click()
        await expect(page.locator('.feedback-message')).toContainText('Correct', { timeout: 2000 })
        await page.waitForTimeout(1600)
      }
    }
    
    // ========== TEST PERSISTENCE ==========
    await navigateTo(page, 'settings')
    await page.reload()
    await expect(page.locator('.stack-option.custom').filter({ hasText: TEST_STACK_NAME })).toHaveClass(/active/)
    
    // ========== TEST EDIT ==========
    await page.locator('.stack-item').filter({ hasText: TEST_STACK_NAME }).locator('.edit-btn').click()
    await expect(page.locator('.stack-builder-page')).toBeVisible()
    await expect(page.locator('.stack-name-input')).toHaveValue(TEST_STACK_NAME)
    await expect(page.locator('.progress-complete')).toBeVisible()
    await page.locator('.back-button').click()
    await expect(page.locator('.settings-view')).toBeVisible()
    
    // ========== TEST DELETE ==========
    // Ensure custom stack is still selected
    await expect(page.locator('.stack-option.custom').filter({ hasText: TEST_STACK_NAME })).toHaveClass(/active/)
    
    // Delete it
    await page.locator('.stack-item').filter({ hasText: TEST_STACK_NAME }).locator('.delete-btn').click()
    await expect(page.locator('.stack-item').filter({ hasText: TEST_STACK_NAME })).not.toBeVisible()
    
    // Should switch to default (Tamariz)
    await waitForTransition(page)
    await expect(page.locator('.stack-option').filter({ hasText: 'Tamariz' })).toHaveClass(/active/)
  })
})
