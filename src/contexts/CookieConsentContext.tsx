import { createContext, useContext, createSignal, createEffect, onMount, type Component, type JSX } from 'solid-js'
import type { CookiePreferences } from '../utils/cookieConsent'
import { 
  hasConsentBeenGiven as checkHasConsent,
  getCookiePreferences as getStoredPreferences,
  saveCookiePreferences as saveStoredPreferences,
  resetCookieConsent as resetStoredConsent,
  DEFAULT_PREFERENCES
} from '../utils/cookieConsent'
import { initializeAnalyticsAfterConsent, disableAnalytics, trackEvent } from '../utils/analytics'
import { CONSENT_GRANTED } from '../constants/analyticsEvents'

interface CookieConsentContextValue {
  preferences: () => CookiePreferences
  hasConsent: () => boolean
  hasAnalyticsConsent: () => boolean
  showCookieDialog: () => boolean
  acceptAllCookies: () => void
  rejectNonEssentialCookies: () => void
  updatePreferences: (preferences: Partial<CookiePreferences>) => void
  resetConsent: () => void
  openCookieDialog: () => void
  closeCookieDialog: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue>()

interface CookieConsentProviderProps {
  children: JSX.Element
}

export const CookieConsentProvider: Component<CookieConsentProviderProps> = (props) => {
  const [preferences, setPreferences] = createSignal<CookiePreferences>(DEFAULT_PREFERENCES)
  const [hasConsent, setHasConsent] = createSignal<boolean>(false)
  const [isInitialized, setIsInitialized] = createSignal<boolean>(false)
  const [showCookieDialog, setShowCookieDialog] = createSignal<boolean>(false)

  // Load preferences from localStorage on mount
  onMount(() => {
    const storedPreferences = getStoredPreferences()
    setPreferences(storedPreferences)
    setHasConsent(checkHasConsent())
    // Mark as initialized AFTER loading stored state to prevent
    // the effect from overwriting stored preferences with defaults
    setIsInitialized(true)
  })

  // Save preferences to localStorage whenever they change
  // Only runs AFTER initial state has been loaded from localStorage
  createEffect(() => {
    const currentPrefs = preferences()

    // Guard: don't save until we've loaded stored state
    if (!isInitialized()) return

    saveStoredPreferences(currentPrefs)
    
    // Handle analytics consent changes
    if (currentPrefs.analytics) {
      initializeAnalyticsAfterConsent()
    } else {
      // Consent revoked or rejected — disable analytics (GDPR compliance)
      disableAnalytics()
    }
  })

  const acceptAllCookies = () => {
    const hadConsentBefore = hasConsent()
    const currentPrefs = preferences()
    const updated = {
      ...currentPrefs,
      analytics: true,
      essential: true,
    }
    setPreferences(updated)
    setHasConsent(true)

    // Track consent grant — fires after GA initializes in the createEffect above.
    // Only fires on first-time acceptance, not on returning visitors who already consented.
    if (!hadConsentBefore) {
      // Small delay to let GA initialize before sending the event
      setTimeout(() => trackEvent(CONSENT_GRANTED), 100)
    }
  }

  const rejectNonEssentialCookies = () => {
    const currentPrefs = preferences()
    const updated = {
      ...currentPrefs,
      analytics: false,
      essential: true,
    }
    setPreferences(updated)
    setHasConsent(true)
  }

  const updatePreferences = (newPrefs: Partial<CookiePreferences>) => {
    const currentPrefs = preferences()
    const updated = {
      ...currentPrefs,
      ...newPrefs,
      essential: true, // Always ensure essential is true
    }
    setPreferences(updated)
    setHasConsent(true)
  }

  const resetConsent = () => {
    resetStoredConsent()
    setPreferences(DEFAULT_PREFERENCES)
    setHasConsent(false)
  }

  const hasAnalyticsConsent = () => {
    return preferences().analytics === true
  }

  const openCookieDialog = () => {
    setShowCookieDialog(true)
  }

  const closeCookieDialog = () => {
    setShowCookieDialog(false)
  }

  const contextValue: CookieConsentContextValue = {
    preferences,
    hasConsent,
    hasAnalyticsConsent,
    showCookieDialog,
    acceptAllCookies,
    rejectNonEssentialCookies,
    updatePreferences,
    resetConsent,
    openCookieDialog,
    closeCookieDialog,
  }

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {props.children}
    </CookieConsentContext.Provider>
  )
}

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider')
  }
  return context
}
