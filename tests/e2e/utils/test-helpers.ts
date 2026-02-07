import { type Page, expect } from '@playwright/test'

// Import stack data from the app's single source of truth
import { TAMARIZ_STACK, getStack, type StackType } from '../../../src/constants/stacks'

// Re-export for test files
export { TAMARIZ_STACK, getStack, type StackType }

/**
 * Test helper utilities for e2e tests
 */

/**
 * Get the position of a card in a stack (1-indexed)
 * Uses TAMARIZ_STACK by default (the app's default stack)
 */
export const getCardPosition = (card: string, stack: string[] = TAMARIZ_STACK): number => {
  const normalizedCard = card.trim().toUpperCase()
  const index = stack.findIndex(c => 
    c.toUpperCase() === normalizedCard || 
    c.toUpperCase().replace('10', 'T') === normalizedCard.replace('10', 'T')
  )
  return index + 1 // 1-indexed
}

/**
 * Get the card at a specific position in a stack (1-indexed)
 * Uses TAMARIZ_STACK by default (the app's default stack)
 */
export const getCardAtPosition = (position: number, stack: string[] = TAMARIZ_STACK): string => {
  return stack[position - 1] || ''
}

/**
 * Get the next card in the stack after a given card
 * Uses TAMARIZ_STACK by default (the app's default stack)
 */
export const getNextCard = (card: string, stack: string[] = TAMARIZ_STACK): string => {
  const position = getCardPosition(card, stack)
  if (position <= 0) return ''
  const nextPosition = position === stack.length ? 1 : position + 1
  return getCardAtPosition(nextPosition, stack)
}

/**
 * Ensure the app is using a specific stack type.
 * Navigates to settings, selects the stack, and returns to the original page.
 */
export const ensureStackType = async (page: Page, stackType: StackType): Promise<void> => {
  // Save current URL to return to
  const currentUrl = page.url()
  
  // Navigate to settings
  await navigateTo(page, 'settings')
  
  // Click the stack option
  const stackNames: Record<StackType, string> = {
    tamariz: 'Tamariz',
    aronson: 'Aronson',
    faro: 'Faro'
  }
  
  const stackButton = page.locator('.stack-option').filter({ hasText: stackNames[stackType] })
  await stackButton.click()
  await waitForTransition(page)
  
  // Return to original page if it wasn't settings
  if (!currentUrl.includes('/settings')) {
    await page.goto(currentUrl)
    await page.waitForLoadState('domcontentloaded')
  }
}

/**
 * Parse the card from a "Card → Position" question
 * Example: "What position is 4♣?" => "4♣"
 */
export const parseCardFromQuestion = (questionText: string): string | null => {
  // Match card patterns like "4♣", "10♥", "Q♠", "A♦"
  const match = questionText.match(/\b([AKQJ]|10|[2-9])[♠♥♦♣]\b/)
  return match ? match[0] : null
}

/**
 * Parse the position from a "Position → Card" question
 * Example: "What card is at position 7?" => 7
 */
export const parsePositionFromQuestion = (questionText: string): number | null => {
  const match = questionText.match(/position\s+(\d+)/i)
  return match ? parseInt(match[1], 10) : null
}

// Navigation paths (HashRouter uses # prefix)
export const ROUTES = {
  stack: '/#/stack',
  practice: '/#/practice',
  stats: '/#/stats',
  settings: '/#/settings',
} as const

// Practice modes
export const PRACTICE_MODES = {
  'card-to-pos': 'Card → Position',
  'pos-to-card': 'Position → Card',
  'one-ahead': 'One Ahead',
  'context': 'Stack Context',
  'cutting': 'Cutting Estimation',
  'first-or-second-half': 'First or Second Half',
  'quartet-position': 'Quartet Position',
  'cut-to-position': 'Cut to Position',
  'plop-denis-behr': 'PLOP - Denis Behr',
} as const

// Stack types
export const STACK_TYPES = ['tamariz', 'aronson', 'faro'] as const

// Navigation tabs
export const NAV_TABS = ['Stack', 'Practice', 'Stats', 'Settings'] as const

/**
 * Navigate to a specific route
 */
export const navigateTo = async (page: Page, route: keyof typeof ROUTES): Promise<void> => {
  await page.goto(ROUTES[route])
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Navigate using the bottom navigation bar (mobile) or sidebar (desktop)
 */
export const clickNavTab = async (page: Page, tabName: string): Promise<void> => {
  // Try mobile bottom nav first, then desktop sidebar
  const bottomNav = page.locator('.bottom-nav')
  const isBottomNavVisible = await bottomNav.isVisible()
  
  if (isBottomNavVisible) {
    await page.locator(`.nav-item`).filter({ hasText: tabName }).click()
  } else {
    // Desktop/Tablet: Use permanent sidebar
    await page.locator('.sidebar-item').filter({ hasText: tabName }).click()
  }
  
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Check if a nav tab is active
 */
export const isNavTabActive = async (page: Page, tabName: string): Promise<boolean> => {
  const bottomNav = page.locator('.bottom-nav')
  const isBottomNavVisible = await bottomNav.isVisible()
  
  if (isBottomNavVisible) {
    const tab = page.locator('.nav-item.active').filter({ hasText: tabName })
    return tab.isVisible()
  } else {
    // Desktop/Tablet: Check sidebar active state
    const tab = page.locator('.sidebar-item.active').filter({ hasText: tabName })
    return tab.isVisible()
  }
}

/**
 * Wait for page animation/transition to complete
 */
export const waitForTransition = async (page: Page, ms: number = 500): Promise<void> => {
  await page.waitForTimeout(ms)
}

/**
 * Select a practice mode from the mode selector
 */
export const selectPracticeMode = async (page: Page, modeId: string): Promise<void> => {
  const modeName = PRACTICE_MODES[modeId as keyof typeof PRACTICE_MODES]
  await page.locator('.mode-card').filter({ hasText: modeName }).click()
  // Wait for the mode to load
  await page.waitForSelector('.practice-header', { timeout: 5000 })
  await waitForTransition(page)
}

/**
 * Go back from a practice mode to the mode selector
 */
export const goBackFromPractice = async (page: Page): Promise<void> => {
  await page.locator('.back-button').click()
  await waitForTransition(page)
}

/**
 * Set cookie consent in localStorage to prevent the cookie dialog from appearing.
 * Call this after localStorage.clear() and before page.reload() to keep consent valid.
 */
export const setCookieConsent = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    localStorage.setItem('mnemonic-cookie-consent', JSON.stringify({
      preferences: { essential: true, analytics: false },
      timestamp: Date.now(),
      version: 1
    }))
  })
}

/**
 * Dismiss the cookie consent dialog if it is currently visible.
 */
export const dismissCookieConsent = async (page: Page): Promise<void> => {
  const overlay = page.locator('.cookie-consent-overlay')
  const isVisible = await overlay.isVisible()
  if (isVisible) {
    await overlay.locator('button').filter({ hasText: 'Essential Only' }).click({ timeout: 2000 })
    await overlay.waitFor({ state: 'hidden', timeout: 2000 })
  }
}

/**
 * Clear localStorage to reset app state
 * Must be called after page.goto()
 */
export const clearAppStorage = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    localStorage.clear()
  })
  await setCookieConsent(page)
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Get the current stack type from settings
 */
export const getCurrentStackType = async (page: Page): Promise<string> => {
  const activeOption = await page.locator('.stack-option.active .option-name').textContent()
  return activeOption?.toLowerCase() || 'tamariz'
}

/**
 * Set the stack type in settings
 */
export const setStackType = async (page: Page, stackType: string): Promise<void> => {
  const stackButton = page.locator('.stack-option').filter({ hasText: new RegExp(stackType, 'i') })
  await stackButton.click()
  await waitForTransition(page)
}

/**
 * Toggle dark mode
 */
export const toggleDarkMode = async (page: Page): Promise<void> => {
  // Find the dark mode toggle by its label context
  const darkModeToggle = page.locator('.form-group').filter({ hasText: 'Dark Mode' }).locator('.toggle-switch')
  await darkModeToggle.click()
}

/**
 * Toggle sound
 */
export const toggleSound = async (page: Page): Promise<void> => {
  const soundToggle = page.locator('.form-group').filter({ hasText: 'Sound Effects' }).locator('.toggle-switch')
  await soundToggle.click()
}

/**
 * Check if element exists and is visible
 */
export const elementExists = async (page: Page, selector: string): Promise<boolean> => {
  const element = page.locator(selector)
  return element.isVisible()
}

/**
 * Count playing cards displayed on the stack page
 */
export const countStackCards = async (page: Page): Promise<number> => {
  const cards = page.locator('.playing-card')
  return cards.count()
}

/**
 * Submit an answer in a practice quiz
 */
export const submitQuizAnswer = async (page: Page, answer: string): Promise<void> => {
  await page.locator('.answer-input').fill(answer)
  await page.locator('.submit-btn').click()
}

/**
 * Get the feedback message from a quiz
 */
export const getQuizFeedback = async (page: Page): Promise<string> => {
  const feedback = page.locator('.feedback-message')
  if (await feedback.isVisible()) {
    return await feedback.textContent() || ''
  }
  return ''
}

/**
 * Check if dark mode is enabled
 */
export const isDarkModeEnabled = async (page: Page): Promise<boolean> => {
  return page.evaluate(() => {
    return document.body.classList.contains('dark-mode') || 
           document.documentElement.getAttribute('data-theme') === 'dark'
  })
}

/**
 * Verify that an element has proper accessibility attributes
 */
export const checkAccessibility = async (page: Page, selector: string): Promise<{
  hasAriaLabel: boolean
  hasRole: boolean
  isKeyboardAccessible: boolean
}> => {
  const element = page.locator(selector).first()
  
  const ariaLabel = await element.getAttribute('aria-label')
  const role = await element.getAttribute('role')
  const tabIndex = await element.getAttribute('tabindex')
  
  return {
    hasAriaLabel: !!ariaLabel,
    hasRole: !!role,
    isKeyboardAccessible: tabIndex !== '-1',
  }
}

/**
 * Get the positions of all four cards of a given rank in a stack (1-indexed)
 * Returns an array of 4 positions
 */
export const getQuartetPositions = (rank: string, stack: string[] = TAMARIZ_STACK): number[] => {
  const positions: number[] = []
  const suits = ['♠', '♥', '♣', '♦']
  
  for (let i = 0; i < stack.length; i++) {
    const card = stack[i]
    if (suits.some(suit => card === rank + suit)) {
      positions.push(i + 1) // 1-indexed
    }
  }
  
  return positions.sort((a, b) => a - b) // Return sorted for consistency
}

/**
 * Parse the rank from a Quartet Position question
 * Example: "Enter the positions of all the 4s in the stack:" => "4"
 */
export const parseRankFromQuartetQuestion = (questionText: string): string | null => {
  // Match rank patterns like "4s", "As", "10s", "Js", "Qs", "Ks"
  const match = questionText.match(/\b([AKQJ]|10|[2-9])s\b/i)
  if (match) {
    return match[1].toUpperCase()
  }
  return null
}

