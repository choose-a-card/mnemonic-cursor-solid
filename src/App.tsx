import { type Component } from 'solid-js'
import { type RouteSectionProps } from '@solidjs/router'
import { StatsProvider } from './contexts/StatsContext'
import { AppSettingsProvider } from './contexts/AppSettingsContext'
import { CustomStacksProvider } from './contexts/CustomStacksContext'
import { CookieConsentProvider } from './contexts/CookieConsentContext'
import { useDebugMode } from './hooks/useDebugMode'
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics'
import AppLayout from './layouts/AppLayout'
import ErrorBoundary from './components/shared/ErrorBoundary'
import CookieConsent from './components/shared/CookieConsent'
import './App.css'

const AppContent: Component<RouteSectionProps> = (props) => {
  // Initialize Google Analytics here, inside the provider tree
  useGoogleAnalytics()
  
  return (
    <AppLayout>
      {props.children}
    </AppLayout>
  )
}

const App: Component<RouteSectionProps> = (props) => {
  const { debugMode } = useDebugMode()

  return (
    <ErrorBoundary>
      <CookieConsentProvider>
        <CustomStacksProvider>
          <AppSettingsProvider debugMode={debugMode()}>
            <StatsProvider debugMode={debugMode()} stack={() => []}>
              <AppContent {...props} />
              <CookieConsent />
            </StatsProvider>
          </AppSettingsProvider>
        </CustomStacksProvider>
      </CookieConsentProvider>
    </ErrorBoundary>
  )
}

export default App
