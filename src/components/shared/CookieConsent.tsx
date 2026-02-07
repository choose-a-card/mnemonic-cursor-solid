import { Component, createSignal, createEffect, Show } from 'solid-js'
import { useCookieConsent } from '../../contexts/CookieConsentContext'
import Button from './Button'
import './CookieConsent.css'

const CookieConsent: Component = () => {
  const {
    preferences,
    hasConsent,
    showCookieDialog,
    acceptAllCookies,
    rejectNonEssentialCookies,
    updatePreferences,
    closeCookieDialog,
  } = useCookieConsent()
  
  const [showBanner, setShowBanner] = createSignal(false)
  const [showDetails, setShowDetails] = createSignal(false)
  const [localPreferences, setLocalPreferences] = createSignal(preferences())

  // Show banner when no consent has been given yet (initial visit)
  // or when explicitly opened from settings via showCookieDialog
  createEffect(() => {
    const shouldShow = !hasConsent() || showCookieDialog()
    if (shouldShow) {
      // Sync local preferences with current stored preferences when opening
      setLocalPreferences(preferences())
      setShowDetails(false)
      setShowBanner(true)
    }
  })

  const handleClose = () => {
    setShowBanner(false)
    closeCookieDialog()
  }

  const handleAcceptAll = () => {
    acceptAllCookies()
    handleClose()
  }

  const handleRejectNonEssential = () => {
    rejectNonEssentialCookies()
    handleClose()
  }

  const handleCustomize = () => {
    setShowDetails(true)
    setLocalPreferences(preferences())
  }

  const handleSavePreferences = () => {
    const currentPrefs = localPreferences()
    updatePreferences(currentPrefs)
    handleClose()
  }

  const handleToggleAnalytics = () => {
    setLocalPreferences({
      ...localPreferences(),
      analytics: !localPreferences().analytics,
    })
  }

  const handleKeyDown = (e: KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <Show when={showBanner()}>
      <div class="cookie-consent-overlay" role="dialog" aria-labelledby="cookie-consent-title" aria-modal="true">
        <div class="cookie-consent-banner">
          <div class="cookie-consent-content">
            <h3 id="cookie-consent-title" class="cookie-consent-title">🍪 Cookie Preferences</h3>
            
            <Show when={!showDetails()}>
              <p class="cookie-consent-description">
                We use cookies to enhance your experience. Essential cookies are required for the app to function. 
                Analytics cookies help us improve the app by understanding how you use it.
              </p>
              
              <div class="cookie-consent-actions">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={handleRejectNonEssential}
                  onKeyDown={(e) => handleKeyDown(e, handleRejectNonEssential)}
                  ariaLabel="Reject non-essential cookies"
                >
                  Essential Only
                </Button>
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={handleCustomize}
                  onKeyDown={(e) => handleKeyDown(e, handleCustomize)}
                  ariaLabel="Customize cookie preferences"
                >
                  Customize
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleAcceptAll}
                  onKeyDown={(e) => handleKeyDown(e, handleAcceptAll)}
                  ariaLabel="Accept all cookies"
                >
                  Accept All
                </Button>
              </div>
            </Show>

            <Show when={showDetails()}>
              <div class="cookie-consent-details">
                <div class="cookie-consent-item">
                  <div class="cookie-consent-item-header">
                    <span class="cookie-consent-item-title">Essential Cookies</span>
                    <span class="cookie-consent-item-status">Always Active</span>
                  </div>
                  <p class="cookie-consent-item-description">
                    Required for the app to function. These cookies store your preferences and practice data locally.
                  </p>
                </div>

                <div class="cookie-consent-item">
                  <div class="cookie-consent-item-header">
                    <span class="cookie-consent-item-title">Analytics Cookies</span>
                    <label class="cookie-consent-toggle-wrapper">
                      <input
                        type="checkbox"
                        checked={localPreferences().analytics}
                        onInput={() => handleToggleAnalytics()}
                        class="cookie-consent-toggle"
                        aria-label="Enable analytics cookies"
                      />
                      <span class="cookie-consent-toggle-label">
                        {localPreferences().analytics ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                  <p class="cookie-consent-item-description">
                    Help us understand how you use the app to improve features and performance. 
                    Powered by Google Analytics.
                  </p>
                </div>

                <div class="cookie-consent-actions">
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => setShowDetails(false)}
                    onKeyDown={(e) => handleKeyDown(e, () => setShowDetails(false))}
                    ariaLabel="Back to cookie options"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={handleSavePreferences}
                    onKeyDown={(e) => handleKeyDown(e, handleSavePreferences)}
                    ariaLabel="Save cookie preferences"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default CookieConsent
