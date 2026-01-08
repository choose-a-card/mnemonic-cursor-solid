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
  if (!isEnabled) return

  if (!GA_MEASUREMENT_ID) return

  // Use the standard GA4 initialization pattern
  // Initialize dataLayer and gtag function inline (as Google recommends)
  const inlineScript = document.createElement('script')
  inlineScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      send_page_view: false
    });
  `
  document.head.appendChild(inlineScript)

  // Load the external GA script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.onerror = () => {
    // Silent error handling in production
  }
  document.head.appendChild(script)
}

/**
 * Track a page view
 * @param path - The path to track (e.g., '/stack', '/practice')
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isEnabled || !GA_MEASUREMENT_ID) return

  if (!window.gtag) return

  // Use 'config' command to update page path
  // This will send a page_view event to GA
  // If the real GA script hasn't loaded yet, this will queue in dataLayer
  // The real script will process it when it loads
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })
  
  // Also explicitly send a page_view event to ensure it's tracked
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
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

  if (!window.gtag) return

  window.gtag('event', eventName, eventParams)
}

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return isEnabled
}


