import './SettingsView.css'
import { createSignal, onMount, Show } from 'solid-js'
import { isPWAInstalled, installPWA, isOnline, getPWAInstallPrompt, checkServiceWorkerStatus } from '../../utils/pwa'
import { isFeatureEnabled } from '../../utils/featureFlags'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { useStats } from '../../contexts/StatsContext'
import { trackEvent } from '../../utils/analytics'
import { PWA_INSTALL_CLICKED, PWA_INSTALL_SUCCESS, PWA_INSTALL_DISMISSED } from '../../constants/analyticsEvents'
import { logger } from '../../utils/logger'
import Card from '../shared/Card'
import StackConfigCard from './StackConfigCard'
import CustomStacksCard from './CustomStacksCard'
import PreferencesCard from './PreferencesCard'
import CookiePreferencesCard from './CookiePreferencesCard'
import DataManagementCard from './DataManagementCard'
import AboutCard from './AboutCard'
import SupportCard from './SupportCard'

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

const isAndroidChrome = (): boolean => {
  const userAgent = navigator.userAgent
  return /Android/.test(userAgent) && /Chrome/.test(userAgent) && !/Edge/.test(userAgent)
}

export default function SettingsView() {
  const { 
    stackType, setStackType, 
    cardInterval, setCardInterval, 
    darkMode, setDarkMode, 
    soundEnabled, setSoundEnabled 
  } = useAppSettings()
  const { resetStats } = useStats()
  const [isInstalled, setIsInstalled] = createSignal(false)
  const [hasPrompt, setHasPrompt] = createSignal(false)
  const [onlineStatus, setOnlineStatus] = createSignal(true)
  const [installing, setInstalling] = createSignal(false)

  onMount(() => {
    if (!isFeatureEnabled('pwaEnabled')) return

    const checkPWAStatus = async () => {
      const installed = isPWAInstalled()
      const promptAvailable = !!getPWAInstallPrompt()
      const swStatus = await checkServiceWorkerStatus()
      
      setIsInstalled(installed)
      setHasPrompt(promptAvailable)
      
      logger.log('PWA Status Check:', {
        installed,
        promptAvailable,
        isIOS: isIOS(),
        isAndroidChrome: isAndroidChrome(),
        userAgent: navigator.userAgent,
        serviceWorkerStatus: swStatus,
      })
    }

    checkPWAStatus()
    setOnlineStatus(isOnline())

    window.addEventListener('online', () => {
      setOnlineStatus(true)
      checkPWAStatus()
    })
    window.addEventListener('offline', () => {
      setOnlineStatus(false)
      checkPWAStatus()
    })

    // Capture the deferred install prompt when the browser fires it
    window.addEventListener('beforeinstallprompt', () => {
      logger.log('beforeinstallprompt event fired!')
      setHasPrompt(true)
      checkPWAStatus()
    })

    window.addEventListener('appinstalled', () => {
      logger.log('appinstalled event fired!')
      setIsInstalled(true)
      setHasPrompt(false)
    })

    // Re-check after a delay to catch late-arriving events
    setTimeout(checkPWAStatus, 3000)
  })

  const handleInstall = async () => {
    if (!isFeatureEnabled('pwaEnabled')) return
    
    trackEvent(PWA_INSTALL_CLICKED)
    setInstalling(true)
    try {
      const success = await installPWA()
      if (success) {
        trackEvent(PWA_INSTALL_SUCCESS)
        setIsInstalled(true)
        setHasPrompt(false)
      } else {
        trackEvent(PWA_INSTALL_DISMISSED)
      }
    } catch (error) {
      logger.error('Installation failed:', error)
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div class="settings-view">
      {/* Main Configuration Section */}
      <div class="settings-main">
        <StackConfigCard
          stackType={stackType()}
          cardInterval={cardInterval()}
          onStackTypeChange={setStackType}
          onCardIntervalChange={setCardInterval}
        />

        <CustomStacksCard />

        <PreferencesCard
          darkMode={darkMode()}
          soundEnabled={soundEnabled()}
          onDarkModeChange={setDarkMode}
          onSoundEnabledChange={setSoundEnabled}
        />
      </div>

      {/* Sidebar Section */}
      <div class="settings-sidebar">
        {/* App Installation - PWA Card */}
        <Show when={isFeatureEnabled('pwaEnabled')}>
          <Card icon="📱" title="App Installation" class="pwa-card">
            <div class="status-indicator">
              <span class={`status-dot ${onlineStatus() ? 'online' : 'offline'}`} />
              <span class="status-text">{onlineStatus() ? 'Online' : 'Offline'}</span>
            </div>
            
            {/* Already installed */}
            <Show when={isInstalled()}>
              <div class="pwa-status installed">
                ✅ App installed and ready for offline use
              </div>
            </Show>
            
            <Show when={!isInstalled()}>
              {/* Deferred prompt available — show one-tap install */}
              <Show when={hasPrompt()}>
                <button 
                  class="install-button" 
                  onClick={handleInstall}
                  disabled={installing()}
                  aria-label="Install Mem Deck app"
                  tabindex="0"
                >
                  {installing() ? 'Installing...' : '📱 Install App'}
                </button>
                <div class="install-hint">
                  Install for offline access and native app experience
                </div>
              </Show>

              {/* No deferred prompt — show manual instructions */}
              <Show when={!hasPrompt()}>
                <div class="mobile-install-options">
                  <Show when={isIOS()}>
                    <h4>Install on iPhone / iPad</h4>
                    <ol>
                      <li>Tap the <strong>Share</strong> button <span aria-hidden="true">⎙</span> in Safari</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                      <li>Tap <strong>"Add"</strong> to confirm</li>
                    </ol>
                  </Show>

                  <Show when={isAndroidChrome()}>
                    <h4>Install on Android</h4>
                    <ol>
                      <li>Tap the <strong>menu</strong> button <span aria-hidden="true">⋮</span></li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                      <li>Tap <strong>"Install"</strong> to confirm</li>
                    </ol>
                  </Show>

                  <Show when={!isIOS() && !isAndroidChrome()}>
                    <h4>Install as App</h4>
                    <ol>
                      <li>Look for the install icon <span aria-hidden="true">⊕</span> in the address bar</li>
                      <li>Or open browser menu → <strong>"Install app"</strong></li>
                    </ol>
                  </Show>

                  <div class="install-hint">
                    Install for offline access and native app experience
                  </div>
                </div>
              </Show>
            </Show>
          </Card>
        </Show>

        <DataManagementCard onResetStats={resetStats} />
        <SupportCard />
        <CookiePreferencesCard />
        <AboutCard />
      </div>
    </div>
  )
}
