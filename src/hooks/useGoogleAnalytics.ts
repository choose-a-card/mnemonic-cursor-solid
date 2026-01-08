import { onMount, createEffect } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { initGoogleAnalytics, trackPageView, trackEvent, isAnalyticsEnabled } from '../utils/analytics'

/**
 * Hook to initialize Google Analytics and track route changes
 * Should be used once in the root App component
 */
export const useGoogleAnalytics = () => {
  const location = useLocation()

  onMount(() => {
    initGoogleAnalytics()
  })

  // Track page views on route changes
  createEffect(() => {
    const path = location.pathname
    if (path) {
      trackPageView(path)
    }
  })

  return {
    trackEvent,
    isEnabled: isAnalyticsEnabled,
  }
}

