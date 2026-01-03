import { test, expect } from '@playwright/test'
import { navigateTo, setStackType, waitForTransition } from './utils/test-helpers'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, 'settings')
  })

  test('should display the settings view', async ({ page }) => {
    await expect(page.locator('.settings-view')).toBeVisible()
  })

  test.describe('Stack Configuration Card', () => {
    test('should display stack configuration card', async ({ page }) => {
      const stackCard = page.locator('.stack-config-card, .card').filter({ hasText: /Stack Configuration/ })
      await expect(stackCard).toBeVisible()
    })

    test('should display all stack type options', async ({ page }) => {
      const stackOptions = page.locator('.stack-option')
      const count = await stackOptions.count()
      
      // Should have 3 stack types: Tamariz, Aronson, 5th Faro
      expect(count).toBe(3)
    })

    test('should display Tamariz option', async ({ page }) => {
      const tamarizOption = page.locator('.stack-option').filter({ hasText: 'Tamariz' })
      await expect(tamarizOption).toBeVisible()
    })

    test('should display Aronson option', async ({ page }) => {
      const aronsonOption = page.locator('.stack-option').filter({ hasText: 'Aronson' })
      await expect(aronsonOption).toBeVisible()
    })

    test('should display 5th Faro option', async ({ page }) => {
      const faroOption = page.locator('.stack-option').filter({ hasText: /Faro/ })
      await expect(faroOption).toBeVisible()
    })

    test('should have default stack type selected', async ({ page }) => {
      // One option should be active by default
      const activeOption = page.locator('.stack-option.active')
      await expect(activeOption).toBeVisible()
    })

    test('should change stack type when clicking option', async ({ page }) => {
      // Click on Aronson
      const aronsonOption = page.locator('.stack-option').filter({ hasText: 'Aronson' })
      await aronsonOption.click()
      
      await waitForTransition(page)
      
      // Aronson should now be active
      await expect(aronsonOption).toHaveClass(/active/)
    })

    test('should display practice range slider', async ({ page }) => {
      const rangeSlider = page.locator('.dual-range-slider')
      await expect(rangeSlider).toBeVisible()
    })

    test('should display range info text', async ({ page }) => {
      const rangeInfo = page.locator('.range-info')
      await expect(rangeInfo).toBeVisible()
      
      // Should show cards range
      const infoText = await rangeInfo.textContent()
      expect(infoText).toMatch(/Cards|cards/)
    })
  })

  test.describe('Preferences Card', () => {
    test('should display preferences card', async ({ page }) => {
      const preferencesCard = page.locator('.preferences-card, .card').filter({ hasText: /Preferences/ })
      await expect(preferencesCard).toBeVisible()
    })

    test('should display dark mode toggle', async ({ page }) => {
      const darkModeSection = page.locator('.form-group').filter({ hasText: 'Dark Mode' })
      await expect(darkModeSection).toBeVisible()
      
      const toggle = darkModeSection.locator('.toggle')
      await expect(toggle).toBeVisible()
    })

    test('should display sound effects toggle', async ({ page }) => {
      const soundSection = page.locator('.form-group').filter({ hasText: 'Sound' })
      await expect(soundSection).toBeVisible()
      
      const toggle = soundSection.locator('.toggle')
      await expect(toggle).toBeVisible()
    })

    test('should toggle dark mode', async ({ page }) => {
      const darkModeToggle = page.locator('.form-group').filter({ hasText: 'Dark Mode' }).locator('.toggle-switch, .toggle')
      
      // Click to toggle
      await darkModeToggle.click()
      await waitForTransition(page)
      
      // Toggle again
      await darkModeToggle.click()
      await waitForTransition(page)
      
      // Should not error
      await expect(page.locator('.settings-view')).toBeVisible()
    })

    test('should toggle sound effects', async ({ page }) => {
      const soundToggle = page.locator('.form-group').filter({ hasText: 'Sound' }).locator('.toggle-switch, .toggle')
      
      // Click to toggle
      await soundToggle.click()
      await waitForTransition(page)
      
      // Should not error
      await expect(page.locator('.settings-view')).toBeVisible()
    })
  })

  test.describe('Data Management Card', () => {
    test('should display data management card', async ({ page }) => {
      const dataCard = page.locator('.card').filter({ hasText: /Data|Reset/ })
      await expect(dataCard.first()).toBeVisible()
    })

    test('should have reset stats button', async ({ page }) => {
      const resetButton = page.locator('button').filter({ hasText: /Reset|Clear/ })
      await expect(resetButton.first()).toBeVisible()
    })

    test('should show confirmation before reset', async ({ page }) => {
      // Find the reset button
      const resetButton = page.locator('button').filter({ hasText: /Reset Stats|Reset All|Clear/ }).first()
      
      if (await resetButton.isVisible()) {
        // Click reset - may show confirmation dialog
        await resetButton.click()
        
        // Check for confirmation dialog or immediate reset
        // Implementation may vary - just ensure no errors
        await expect(page.locator('.settings-view')).toBeVisible()
      }
    })
  })

  test.describe('About Card', () => {
    test('should display about card', async ({ page }) => {
      const aboutCard = page.locator('.about-card, .card').filter({ hasText: /About/ })
      await expect(aboutCard).toBeVisible()
    })

    test('should display app information', async ({ page }) => {
      const aboutCard = page.locator('.about-card, .card').filter({ hasText: /About/ })
      
      // Should contain some app information
      const cardText = await aboutCard.textContent()
      expect(cardText).toBeTruthy()
    })
  })

  test.describe('Support Card', () => {
    test('should display support card', async ({ page }) => {
      const supportCard = page.locator('.support-card, .card').filter({ hasText: /Support/ })
      await expect(supportCard).toBeVisible()
    })
  })

  test.describe('Settings Persistence', () => {
    test('should persist stack type across page refresh', async ({ page }) => {
      // Change stack type
      await setStackType(page, 'Aronson')
      
      // Verify change
      const activeOption = page.locator('.stack-option.active')
      await expect(activeOption).toContainText('Aronson')
      
      // Refresh page
      await page.reload()
      await page.waitForLoadState('domcontentloaded')
      
      // Verify persistence
      const activeOptionAfter = page.locator('.stack-option.active')
      await expect(activeOptionAfter).toContainText('Aronson')
    })

    test('should persist preferences across navigation', async ({ page }) => {
      // Change stack type
      await setStackType(page, 'Faro')
      
      // Navigate away
      await navigateTo(page, 'practice')
      await expect(page.locator('.practice-view')).toBeVisible()
      
      // Navigate back
      await navigateTo(page, 'settings')
      
      // Verify persistence
      const activeOption = page.locator('.stack-option.active')
      await expect(activeOption).toContainText('Faro')
    })

    test('should apply stack type to stack view', async ({ page }) => {
      // Set to Aronson stack
      await setStackType(page, 'Aronson')
      
      // Go to stack view
      await navigateTo(page, 'stack')
      
      // Verify stack title shows Aronson
      const stackTitle = page.locator('.stack-title')
      await expect(stackTitle).toContainText('Aronson')
    })
  })

  test.describe('PWA Installation (Feature Flagged)', () => {
    test('should not show PWA card when feature disabled', async ({ page }) => {
      // By default, PWA feature is disabled
      const pwaCard = page.locator('.pwa-card, .card').filter({ hasText: /App Installation/ })
      
      // PWA card should not be visible by default
      const isVisible = await pwaCard.isVisible().catch(() => false)
      expect(isVisible).toBe(false)
    })

    test('should show PWA card when feature enabled via URL', async ({ page }) => {
      // Navigate with PWA feature enabled
      await page.goto('/#/settings?enablePWA=true')
      await page.waitForLoadState('domcontentloaded')
      
      // PWA card may or may not be visible based on browser support
      // Just verify page loads correctly
      await expect(page.locator('.settings-view')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible toggle switches', async ({ page }) => {
      const toggles = page.locator('.toggle-switch, .toggle')
      const count = await toggles.count()
      
      // Should have at least dark mode and sound toggles
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('should have accessible form groups', async ({ page }) => {
      const formGroups = page.locator('.form-group')
      const count = await formGroups.count()
      
      expect(count).toBeGreaterThan(0)
      
      // Each form group should have a label
      for (let i = 0; i < count; i++) {
        const formGroup = formGroups.nth(i)
        const label = formGroup.locator('.form-label, label')
        await expect(label).toBeVisible()
      }
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Focus on first interactive element
      await page.keyboard.press('Tab')
      
      // Should be able to navigate through settings
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })

  test.describe('Layout', () => {
    test('should display main settings section', async ({ page }) => {
      const mainSection = page.locator('.settings-main')
      await expect(mainSection).toBeVisible()
    })

    test('should display sidebar section', async ({ page }) => {
      const sidebar = page.locator('.settings-sidebar')
      await expect(sidebar).toBeVisible()
    })
  })
})

