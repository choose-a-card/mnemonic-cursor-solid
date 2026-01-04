import { test, expect } from '@playwright/test'
import { ROUTES, NAV_TABS, clickNavTab, navigateTo, isNavTabActive } from './utils/test-helpers'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the root, which redirects to /stack
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should redirect root to stack page', async ({ page }) => {
    // The app should redirect / to /#/stack
    await expect(page).toHaveURL(/#\/stack/)
  })

  test('should display main navigation tabs', async ({ page }) => {
    // Check that all navigation tabs are visible (mobile bottom nav or desktop sidebar)
    const bottomNav = page.locator('.bottom-nav')
    const bottomNavVisible = await bottomNav.isVisible()

    if (bottomNavVisible) {
      // Mobile view - check bottom navigation
      for (const tab of NAV_TABS) {
        const navItem = page.locator('.nav-item').filter({ hasText: tab })
        await expect(navItem).toBeVisible()
      }
    } else {
      // Desktop/Tablet view - check permanent sidebar exists
      const sidebar = page.locator('.desktop-sidebar')
      await expect(sidebar).toBeVisible()
      
      // Verify all tabs are in the sidebar
      for (const tab of NAV_TABS) {
        const sidebarItem = page.locator('.sidebar-item').filter({ hasText: tab })
        await expect(sidebarItem).toBeVisible()
      }
    }
  })

  test('should navigate to Practice page', async ({ page }) => {
    await clickNavTab(page, 'Practice')
    await expect(page).toHaveURL(/#\/practice/)
    
    // Verify practice page content is displayed
    await expect(page.locator('.practice-view')).toBeVisible()
  })

  test('should navigate to Stats page', async ({ page }) => {
    await clickNavTab(page, 'Stats')
    await expect(page).toHaveURL(/#\/stats/)
    
    // Verify stats page content is displayed
    await expect(page.locator('.stats-view')).toBeVisible()
  })

  test('should navigate to Settings page', async ({ page }) => {
    await clickNavTab(page, 'Settings')
    await expect(page).toHaveURL(/#\/settings/)
    
    // Verify settings page content is displayed
    await expect(page.locator('.settings-view')).toBeVisible()
  })

  test('should navigate to Stack page', async ({ page }) => {
    // First navigate away from stack
    await clickNavTab(page, 'Practice')
    await expect(page).toHaveURL(/#\/practice/)
    
    // Then navigate back to stack
    await clickNavTab(page, 'Stack')
    await expect(page).toHaveURL(/#\/stack/)
    
    // Verify stack page content is displayed
    await expect(page.locator('.stack-view')).toBeVisible()
  })

  test('should highlight active navigation tab', async ({ page }) => {
    // Navigate to each page and verify the tab is active
    const routes: Array<{ tab: string; path: RegExp }> = [
      { tab: 'Stack', path: /#\/stack/ },
      { tab: 'Practice', path: /#\/practice/ },
      { tab: 'Stats', path: /#\/stats/ },
      { tab: 'Settings', path: /#\/settings/ },
    ]

    for (const route of routes) {
      await clickNavTab(page, route.tab)
      await expect(page).toHaveURL(route.path)
      
      // Check that the active class is applied
      const bottomNav = page.locator('.bottom-nav')
      const bottomNavVisible = await bottomNav.isVisible()
      
      if (bottomNavVisible) {
        const activeItem = page.locator('.nav-item.active')
        await expect(activeItem).toBeVisible()
        await expect(activeItem).toContainText(route.tab)
      } else {
        // Desktop/Tablet: Check sidebar active state
        const activeItem = page.locator('.sidebar-item.active')
        await expect(activeItem).toBeVisible()
        await expect(activeItem).toHaveAttribute('aria-current', 'page')
      }
    }
  })

  test('should support direct URL navigation', async ({ page }) => {
    // Navigate directly to each route
    await page.goto('/#/practice')
    await expect(page.locator('.practice-view')).toBeVisible()

    await page.goto('/#/stats')
    await expect(page.locator('.stats-view')).toBeVisible()

    await page.goto('/#/settings')
    await expect(page.locator('.settings-view')).toBeVisible()

    await page.goto('/#/stack')
    await expect(page.locator('.stack-view')).toBeVisible()
  })

  test('should handle keyboard navigation on nav tabs', async ({ page }) => {
    const bottomNav = page.locator('.bottom-nav')
    const bottomNavVisible = await bottomNav.isVisible()

    if (bottomNavVisible) {
      // Mobile: Focus on first nav item
      const firstNavItem = page.locator('.nav-item').first()
      await firstNavItem.focus()
      
      // Verify it can receive focus
      await expect(firstNavItem).toBeFocused()
      
      // Press Enter to activate
      await page.keyboard.press('Enter')
      await page.waitForLoadState('domcontentloaded')
    } else {
      // Desktop/Tablet: Focus on first sidebar item
      const firstSidebarItem = page.locator('.sidebar-item').first()
      await firstSidebarItem.focus()
      
      // Verify it can receive focus
      await expect(firstSidebarItem).toBeFocused()
      
      // Press Enter to activate
      await page.keyboard.press('Enter')
      await page.waitForLoadState('domcontentloaded')
    }
  })

  test('should have accessible navigation elements', async ({ page }) => {
    const bottomNav = page.locator('.bottom-nav')
    const bottomNavVisible = await bottomNav.isVisible()

    if (bottomNavVisible) {
      // Mobile: Check bottom nav has proper role
      await expect(bottomNav).toHaveAttribute('role', 'tablist')
      await expect(bottomNav).toHaveAttribute('aria-label')

      // Check nav items have aria attributes
      const navItems = page.locator('.nav-item')
      const count = await navItems.count()
      
      for (let i = 0; i < count; i++) {
        const item = navItems.nth(i)
        await expect(item).toHaveAttribute('role', 'tab')
        await expect(item).toHaveAttribute('aria-label')
      }
    } else {
      // Desktop/Tablet: Check sidebar has proper attributes
      const sidebar = page.locator('.desktop-sidebar')
      await expect(sidebar).toHaveAttribute('role', 'navigation')
      await expect(sidebar).toHaveAttribute('aria-label')

      // Check sidebar items have aria-label
      const sidebarItems = page.locator('.sidebar-item')
      const count = await sidebarItems.count()
      
      for (let i = 0; i < count; i++) {
        const item = sidebarItems.nth(i)
        await expect(item).toHaveAttribute('aria-label')
      }
    }
  })
})

