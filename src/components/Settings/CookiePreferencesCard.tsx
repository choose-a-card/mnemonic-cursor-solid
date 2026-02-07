import { Component } from 'solid-js'
import Card from '../shared/Card'
import Button from '../shared/Button'
import { useCookieConsent } from '../../contexts/CookieConsentContext'
import './CookiePreferencesCard.css'

const CookiePreferencesCard: Component = () => {
  const { preferences, openCookieDialog } = useCookieConsent()

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openCookieDialog()
    }
  }

  const analyticsStatusLabel = () =>
    preferences().analytics ? 'Enabled' : 'Disabled'

  return (
    <Card icon="🍪" title="Cookie Preferences">
      <div class="cookie-prefs-summary">
        <span class="cookie-prefs-summary-label">Analytics:</span>
        <span
          class="cookie-prefs-summary-value"
          classList={{ 'cookie-prefs-summary-enabled': preferences().analytics }}
        >
          {analyticsStatusLabel()}
        </span>
      </div>
      <Button
        variant="secondary"
        size="small"
        onClick={openCookieDialog}
        onKeyDown={handleKeyDown}
        ariaLabel="Manage cookie preferences"
      >
        Manage Cookies
      </Button>
    </Card>
  )
}

export default CookiePreferencesCard
