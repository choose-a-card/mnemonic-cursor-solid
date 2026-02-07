import { onMount, createEffect, createMemo } from 'solid-js'
import { useLocation } from '@solidjs/router'
import {
  initGoogleAnalytics,
  trackPageView,
  trackEvent,
  isAnalyticsEnabled,
  initializeAnalyticsAfterConsent,
  disableAnalytics,
  isAnalyticsInitialized,
} from '../utils/analytics'
import { useCookieConsent } from '../contexts/CookieConsentContext'

/**
 * Hook to initialize Google Analytics and track route changes.
 * Handles:
 * - Initial GA setup (if consent already given)
 * - Reactive consent changes (init on accept, cleanup on revoke)
 * - Automatic page view tracking on route changes
 * 
 * Should be used once in the root App component.
 */
export const useGoogleAnalytics = () => {
  const location = useLocation()
  const { hasAnalyticsConsent } = useCookieConsent()

  const analyticsConsent = createMemo(() => hasAnalyticsConsent())

  // Try to initialize on mount if consent is already given
  onMount(() => {
    initGoogleAnalytics()
  })

  // React to consent changes
  createEffect(() => {
    const hasConsent = analyticsConsent()

    if (hasConsent && !isAnalyticsInitialized()) {
      // Consent was just granted — initialize GA
      initializeAnalyticsAfterConsent()
    } else if (!hasConsent && isAnalyticsInitialized()) {
      // Consent was revoked — disable GA (GDPR compliance)
      disableAnalytics()
    }
  })

  // Track page views on route changes
  createEffect(() => {
    const path = location.pathname
    if (path && analyticsConsent()) {
      trackPageView(path)
    }
  })

  return {
    trackEvent,
    isEnabled: isAnalyticsEnabled,
  }
}
