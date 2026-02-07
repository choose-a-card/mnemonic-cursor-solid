/**
 * Cookie Consent Management
 * 
 * Handles cookie consent preferences and ensures compliance with GDPR/CCPA.
 * Essential cookies (localStorage for app functionality) are always enabled.
 * Analytics cookies require explicit user consent.
 */

import { saveToLocalStorage, loadFromLocalStorage } from './pwa'
import { logger } from './logger'

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean; // Google Analytics - requires consent
}

const COOKIE_CONSENT_KEY = 'mnemonic-cookie-consent'
const COOKIE_CONSENT_VERSION = 1 // Increment when consent structure changes

interface StoredConsent {
  preferences: CookiePreferences;
  timestamp: number;
  version: number;
}

export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Always enabled
  analytics: false, // Requires explicit consent
}

/**
 * Check if user has given consent (any consent, not necessarily all cookies)
 */
export const hasConsentBeenGiven = (): boolean => {
  try {
    const stored = loadFromLocalStorage<StoredConsent | null>(COOKIE_CONSENT_KEY, null)
    return stored !== null && stored.preferences !== undefined
  } catch (error) {
    logger.error('Error checking consent:', error)
    return false
  }
}
  

/**
 * Get current cookie preferences
 */
export const getCookiePreferences = (): CookiePreferences => {
  try {
    const stored = loadFromLocalStorage<StoredConsent | null>(COOKIE_CONSENT_KEY, null)
    // If no stored consent or version mismatch, return defaults
    if (!stored || stored.version !== COOKIE_CONSENT_VERSION) {
      return { ...DEFAULT_PREFERENCES }
    
    }
    
    return {
      ...DEFAULT_PREFERENCES,
      ...stored.preferences,
      essential: true, // Always ensure essential is true
    }
  } catch (error) {
    logger.error('Error loading cookie preferences:', error)
    return { ...DEFAULT_PREFERENCES }
  }
}

/**
 * Save cookie preferences
 */
export const saveCookiePreferences = (preferences: Partial<CookiePreferences>): void => {
  try {
    const currentPreferences = getCookiePreferences()
    const newPreferences: CookiePreferences = {
      ...currentPreferences,
      ...preferences,
      essential: true, // Always ensure essential is true
    }
    
    const stored: StoredConsent = {
      preferences: newPreferences,
      timestamp: Date.now(),
      version: COOKIE_CONSENT_VERSION,
    }
    
    saveToLocalStorage(COOKIE_CONSENT_KEY, stored)
    logger.log('Cookie preferences saved:', newPreferences)
  } catch (error) {
    logger.error('Error saving cookie preferences:', error)
  }
}

/**
 * Accept all cookies (analytics enabled)
 */
export const acceptAllCookies = (): void => {
  saveCookiePreferences({
    analytics: true,
  })
}

/**
 * Reject non-essential cookies (analytics disabled)
 */
export const rejectNonEssentialCookies = (): void => {
  saveCookiePreferences({
    analytics: false,
  })
}

/**
 * Check if analytics consent has been given
 */
export const hasAnalyticsConsent = (): boolean => {
  const preferences = getCookiePreferences()
  return preferences.analytics === true
}

/**
 * Reset consent (for testing or user request)
 */
export const resetCookieConsent = (): void => {
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    logger.log('Cookie consent reset')
  } catch (error) {
    logger.error('Error resetting cookie consent:', error)
  }
}
