/**
 * Google Analytics 4 (GA4) Integration
 * 
 * This utility provides functions to initialize and track events with Google Analytics.
 * Analytics are only active in production builds when a measurement ID is provided.
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const isProduction = import.meta.env.PROD
const isEnabled = Boolean(GA_MEASUREMENT_ID && isProduction)

/**
 * Initialize Google Analytics
 * Should be called once when the app loads
 */
export const initGoogleAnalytics = (): void => {
  if (!isEnabled) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Disabled in development mode')
    }
    return
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  // Configure GA
  if (!GA_MEASUREMENT_ID) return
  
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually for SPA routing
  })

  // Load the GA script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

/**
 * Track a page view
 * @param path - The path to track (e.g., '/stack', '/practice')
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isEnabled || !GA_MEASUREMENT_ID) return

  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  })
}

/**
 * Track a custom event
 * @param eventName - Name of the event (e.g., 'button_click', 'practice_started')
 * @param eventParams - Optional parameters for the event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
): void => {
  if (!isEnabled) return

  window.gtag?.('event', eventName, eventParams)
}

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return isEnabled
}

