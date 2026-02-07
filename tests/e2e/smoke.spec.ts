import { test, expect } from '@playwright/test'
import { clickNavTab, navigateTo, setCookieConsent } from './utils/test-helpers'

/**
 * Smoke tests - High-level tests that verify the critical user flows work end-to-end.
 * Run these first to catch major issues before running the full suite.
 */
test.describe('Smoke Tests', () => {
  test('should complete a full practice session', async ({ page }) => {
    // 1. Start at home page
    await page.goto('/')
    await expect(page).toHaveURL(/#\/stack/)
    
    // 2. View the stack
    await expect(page.locator('.stack-view')).toBeVisible()
    await expect(page.locator('.playing-card').first()).toBeVisible()
    
    // 3. Navigate to Practice
    await clickNavTab(page, 'Practice')
    await expect(page).toHaveURL(/#\/practice/)
    
    // 4. Select a practice mode
    const modeCard = page.locator('.mode-card').first()
    await expect(modeCard).toBeVisible()
    await modeCard.click()
    
    // 5. Verify practice mode loads
    await expect(page.locator('.practice-header')).toBeVisible()
    
    // 6. Answer a question (if there's an input)
    const answerInput = page.locator('.answer-input, input[type="number"]').first()
    if (await answerInput.isVisible()) {
      await answerInput.fill('1')
      await page.locator('.submit-btn, button[type="submit"]').first().click()
      
      // 7. Verify feedback appears
      await expect(page.locator('.feedback-message')).toBeVisible({ timeout: 2000 })
    }
    
    // 8. Go back to mode selector
    await page.locator('.back-button').click()
    await expect(page.locator('.practice-mode-selector')).toBeVisible()
    
    // 9. Navigate to Stats
    await clickNavTab(page, 'Stats')
    await expect(page).toHaveURL(/#\/stats/)
    await expect(page.locator('.stats-view')).toBeVisible()
    
    // 10. Navigate to Settings
    await clickNavTab(page, 'Settings')
    await expect(page).toHaveURL(/#\/settings/)
    await expect(page.locator('.settings-view')).toBeVisible()
  })

  test('should change settings and verify they persist', async ({ page }) => {
    // 1. Go to settings
    await navigateTo(page, 'settings')
    await expect(page.locator('.settings-view')).toBeVisible()
    
    // 2. Change stack type to Aronson
    const aronsonButton = page.locator('.stack-option').filter({ hasText: 'Aronson' })
    await aronsonButton.click()
    await expect(aronsonButton).toHaveClass(/active/)
    
    // 3. Navigate to Stack to verify change
    await clickNavTab(page, 'Stack')
    await expect(page.locator('.stack-title')).toContainText('Aronson')
    
    // 4. Refresh page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    
    // 5. Verify settings persisted
    await expect(page.locator('.stack-title')).toContainText('Aronson')
    
    // 6. Go back to settings and verify
    await clickNavTab(page, 'Settings')
    const activeButton = page.locator('.stack-option.active')
    await expect(activeButton).toContainText('Aronson')
  })

  test('should track stats across practice sessions', async ({ page }) => {
    // 1. Clear storage for clean state
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await setCookieConsent(page)
    await page.reload()
    
    // 2. Practice multiple questions
    await clickNavTab(page, 'Practice')
    await page.locator('.mode-card').first().click()
    await page.waitForSelector('.practice-header')
    
    // Answer 3 questions
    for (let i = 0; i < 3; i++) {
      const answerInput = page.locator('.answer-input, input[type="number"]').first()
      if (await answerInput.isVisible()) {
        await answerInput.fill(String(i + 1))
        await page.locator('.submit-btn, button[type="submit"]').first().click()
        await page.waitForTimeout(1700) // Wait for feedback timer
      }
    }
    
    // 3. Go to stats and verify
    await clickNavTab(page, 'Stats')
    await expect(page.locator('.stats-view')).toBeVisible()
    
    // Stats should show some answered questions
    await expect(page.locator('.stats-grid')).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 1. Load app
    await page.goto('/')
    await expect(page).toHaveURL(/#\/stack/)
    
    // 2. Verify bottom navigation is visible (mobile)
    const bottomNav = page.locator('.bottom-nav')
    await expect(bottomNav).toBeVisible()
    
    // 3. Navigate through all tabs
    const tabs = ['Practice', 'Stats', 'Settings', 'Stack']
    for (const tab of tabs) {
      await page.locator('.nav-item').filter({ hasText: tab }).click()
      await page.waitForLoadState('domcontentloaded')
    }
    
    // 4. Verify final navigation worked
    await expect(page).toHaveURL(/#\/stack/)
  })

  test('should handle rapid navigation without errors', async ({ page }) => {
    await page.goto('/')
    
    // Rapidly navigate between pages using direct URL navigation
    const routes = ['/#/practice', '/#/stats', '/#/settings', '/#/stack']
    
    for (let i = 0; i < 10; i++) {
      const randomRoute = routes[Math.floor(Math.random() * routes.length)]
      await page.goto(randomRoute)
      await page.waitForTimeout(100)
    }
    
    // App should still be functional
    await expect(page.locator('.stack-view, .practice-view, .stats-view, .settings-view').first()).toBeVisible()
  })
})

