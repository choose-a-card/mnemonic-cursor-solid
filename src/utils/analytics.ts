/**
 * Google Analytics 4 (GA4) Integration
 * 
 * Production-ready analytics utility with:
 * - Consent-gated initialization (GDPR/CCPA compliant)
 * - Duplicate injection guards
 * - Consent revocation support
 * - XSS-safe measurement ID validation
 * - Try/catch wrapped calls for ad-blocker resilience
 * - Dev-mode logging
 * 
 * Works in both dev and production when VITE_GA_MEASUREMENT_ID is set.
 */

import { hasAnalyticsConsent } from './cookieConsent'

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

// GA4 Measurement IDs follow the pattern G-XXXXXXXXXX
const GA_MEASUREMENT_ID_REGEX = /^G-[A-Z0-9]{6,12}$/

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''
const isDevelopment = import.meta.env.DEV

// Validate measurement ID format to prevent XSS via env injection
const isValidMeasurementId = GA_MEASUREMENT_ID_REGEX.test(GA_MEASUREMENT_ID)
const isEnabled = Boolean(GA_MEASUREMENT_ID) && isValidMeasurementId

// Module-level flag to prevent duplicate script injection
let isGAInitialized = false

// Script element references for cleanup on consent revocation
let gaInlineScript: HTMLScriptElement | null = null
let gaExternalScript: HTMLScriptElement | null = null

/**
 * Log only in development mode
 */
const devLog = (...args: unknown[]): void => {
  if (isDevelopment) {
    console.log('[Analytics]', ...args)
  }
}

/**
 * Inject GA4 scripts into the document head.
 * Guarded against duplicate injection.
 */
const injectGAScripts = (): void => {
  if (isGAInitialized) {
    devLog('Already initialized, skipping script injection')
    return
  }

  if (!isEnabled) return

  // Initialize dataLayer and gtag function (standard GA4 pattern)
  gaInlineScript = document.createElement('script')
  gaInlineScript.id = 'ga-inline-init'
  gaInlineScript.textContent = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    `gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`,
  ].join('\n')
  document.head.appendChild(gaInlineScript)

  // Load the external GA4 library
  gaExternalScript = document.createElement('script')
  gaExternalScript.id = 'ga-external'
  gaExternalScript.async = true
  gaExternalScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  gaExternalScript.onerror = () => {
    devLog('Failed to load GA script (ad blocker or network issue)')
  }
  document.head.appendChild(gaExternalScript)

  isGAInitialized = true
  devLog('Scripts injected successfully with ID:', GA_MEASUREMENT_ID)
}

/**
 * Initialize Google Analytics.
 * Should be called once when the app loads.
 * Only initializes if:
 *  - A valid measurement ID is provided
 *  - User has given analytics consent
 */
export const initGoogleAnalytics = (): void => {
  if (!isEnabled) {
    if (isDevelopment && !GA_MEASUREMENT_ID) {
      devLog('Disabled: No VITE_GA_MEASUREMENT_ID found in environment variables')
    }
    if (isDevelopment && GA_MEASUREMENT_ID && !isValidMeasurementId) {
      devLog('Disabled: Invalid measurement ID format:', GA_MEASUREMENT_ID)
    }
    return
  }

  if (!hasAnalyticsConsent()) {
    devLog('Waiting for user consent...')
    return
  }

  devLog('Initializing Google Analytics...')
  injectGAScripts()
}

/**
 * Initialize Google Analytics after consent is given.
 * Called when user accepts analytics cookies.
 * Safe to call multiple times — will no-op if already initialized.
 */
export const initializeAnalyticsAfterConsent = (): void => {
  if (!isEnabled) {
    devLog('Cannot initialize: missing or invalid measurement ID')
    return
  }

  if (!hasAnalyticsConsent()) {
    devLog('Cannot initialize: no consent given')
    return
  }

  if (isGAInitialized) {
    devLog('Already initialized')
    return
  }

  devLog('Initializing after consent...')
  injectGAScripts()
}

/**
 * Track a page view.
 * Uses the GA4 event-based approach (not config-based) to avoid double counting.
 * @param path - The path to track (e.g., '/stack', '/practice')
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isEnabled || !isGAInitialized) return
  if (!hasAnalyticsConsent()) return

  try {
    if (!window.gtag) {
      devLog('gtag not available, skipping page view:', path)
      return
    }

    devLog('Tracking page view:', path)

    // Send a single page_view event (avoid double-counting)
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    })
  } catch (error) {
    devLog('Error tracking page view:', error)
  }
}

/**
 * Track a custom event.
 * @param eventName - Name of the event (e.g., 'practice_mode_selected')
 * @param eventParams - Optional parameters for the event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
): void => {
  if (!isEnabled || !isGAInitialized) return
  if (!hasAnalyticsConsent()) {
    devLog('Event blocked (no consent):', eventName)
    return
  }

  try {
    if (!window.gtag) {
      devLog('gtag not available, skipping event:', eventName)
      return
    }

    devLog('Tracking event:', eventName, eventParams)
    window.gtag('event', eventName, eventParams)
  } catch (error) {
    devLog('Error tracking event:', error)
  }
}

/**
 * Disable analytics and remove GA scripts.
 * Call this when user revokes analytics consent (GDPR compliance).
 * 
 * Uses GA's official opt-out property to immediately stop all tracking,
 * then cleans up scripts and cookies. dataLayer is kept as an empty array
 * (not undefined) so any pending GA setTimeout callbacks don't crash.
 */
export const disableAnalytics = (): void => {
  if (!isGAInitialized) return

  devLog('Disabling analytics and cleaning up...')

  // 1. Use GA's official opt-out mechanism to immediately stop tracking.
  //    This prevents any further data collection even if the script is still loaded.
  //    See: https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
  if (GA_MEASUREMENT_ID) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true
  }

  // 2. Remove injected scripts from the DOM
  if (gaInlineScript?.parentNode) {
    gaInlineScript.parentNode.removeChild(gaInlineScript)
    gaInlineScript = null
  }
  if (gaExternalScript?.parentNode) {
    gaExternalScript.parentNode.removeChild(gaExternalScript)
    gaExternalScript = null
  }

  // 3. Replace gtag with a no-op, and keep dataLayer as an empty array.
  //    The external GA script has async callbacks (setTimeout) that still
  //    reference dataLayer.push() — setting it to undefined would crash them.
  window.gtag = () => { /* no-op after opt-out */ }
  window.dataLayer = []

  // 4. Remove GA cookies (_ga and _ga_<ID>)
  try {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim()
      if (cookieName.startsWith('_ga')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
      }
    }
  } catch (error) {
    devLog('Error clearing GA cookies:', error)
  }

  isGAInitialized = false
  devLog('Analytics disabled and cleaned up')
}

/**
 * Check if analytics is enabled and properly configured.
 */
export const isAnalyticsEnabled = (): boolean => {
  return isEnabled
}

/**
 * Check if analytics has been initialized (scripts injected).
 */
export const isAnalyticsInitialized = (): boolean => {
  return isGAInitialized
}
