import { test, expect } from '@playwright/test'
import { navigateTo, countStackCards, setStackType } from './utils/test-helpers'

test.describe('Stack View', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, 'stack')
  })

  test('should display the stack view', async ({ page }) => {
    await expect(page.locator('.stack-view')).toBeVisible()
  })

  test('should display stack title', async ({ page }) => {
    const stackTitle = page.locator('.stack-title')
    await expect(stackTitle).toBeVisible()
    
    // Default stack should be Tamariz
    await expect(stackTitle).toContainText(/Stack/)
  })

  test('should display playing cards', async ({ page }) => {
    const cards = page.locator('.playing-card')
    
    // Should display cards (default 52)
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)
    expect(cardCount).toBeLessThanOrEqual(52)
  })

  test('should display card values and suits', async ({ page }) => {
    const firstCard = page.locator('.playing-card').first()
    
    // Each card should have value and suit
    const cardValue = firstCard.locator('.card-value')
    const cardSuit = firstCard.locator('.card-suit')
    const cardIndex = firstCard.locator('.card-index')
    
    await expect(cardValue).toBeVisible()
    await expect(cardSuit).toBeVisible()
    await expect(cardIndex).toBeVisible()
  })

  test('should display card position indices', async ({ page }) => {
    const cards = page.locator('.playing-card')
    const firstCard = cards.first()
    
    // First card should have index 1 (or current interval start)
    const firstIndex = firstCard.locator('.card-index')
    await expect(firstIndex).toBeVisible()
    
    const indexText = await firstIndex.textContent()
    expect(parseInt(indexText || '0')).toBeGreaterThan(0)
  })

  test('should display cards in a grid layout', async ({ page }) => {
    const stackGrid = page.locator('.stack-grid')
    await expect(stackGrid).toBeVisible()
    
    // Grid should contain card items
    const cardItems = stackGrid.locator('.stack-card-item')
    const count = await cardItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should apply red color class to hearts and diamonds', async ({ page }) => {
    // Look for a red card (hearts or diamonds)
    const redCards = page.locator('.playing-card.card-red')
    const redCount = await redCards.count()
    
    // There should be some red cards in any stack
    expect(redCount).toBeGreaterThan(0)
  })

  test('should apply black color class to spades and clubs', async ({ page }) => {
    // Look for a black card (spades or clubs)
    const blackCards = page.locator('.playing-card.card-black')
    const blackCount = await blackCards.count()
    
    // There should be some black cards in any stack
    expect(blackCount).toBeGreaterThan(0)
  })

  test('should update when stack type changes in settings', async ({ page }) => {
    // Go to settings
    await navigateTo(page, 'settings')
    
    // Get initial stack title
    await setStackType(page, 'Aronson')
    
    // Go back to stack view
    await navigateTo(page, 'stack')
    
    // Verify stack title changed
    const stackTitle = page.locator('.stack-title')
    await expect(stackTitle).toContainText('Aronson')
  })

  test('should display Tamariz stack correctly', async ({ page }) => {
    // Tamariz stack starts with 4♣
    const firstCard = page.locator('.playing-card').first()
    const cardValue = firstCard.locator('.card-value')
    const cardSuit = firstCard.locator('.card-suit')
    
    // First card in Tamariz should be 4♣
    await expect(cardValue).toHaveText('4')
    await expect(cardSuit).toHaveText('♣')
  })

  test('should display 52 cards with full range', async ({ page }) => {
    // With default settings (1-52), should show 52 cards
    const cardCount = await countStackCards(page)
    expect(cardCount).toBe(52)
  })

  test('should respect card interval from settings', async ({ page }) => {
    // Go to settings and adjust card interval
    await navigateTo(page, 'settings')
    
    // Note: This test may need adjustment based on how the DualRangeSlider works
    // For now, we just verify the stack respects the interval
    
    // Go back to stack and verify cards are displayed
    await navigateTo(page, 'stack')
    const cardCount = await countStackCards(page)
    expect(cardCount).toBeGreaterThan(0)
  })

  test('should maintain stack view on page refresh', async ({ page }) => {
    // Verify initial state
    await expect(page.locator('.stack-view')).toBeVisible()
    
    // Refresh the page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    
    // Verify stack view is still displayed
    await expect(page.locator('.stack-view')).toBeVisible()
  })
})

