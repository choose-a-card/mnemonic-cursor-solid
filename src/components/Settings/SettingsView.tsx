import './SettingsView.css'
import { createSignal, onMount, Show } from 'solid-js'
import { isPWAInstallable, isPWAInstalled, installPWA, isOnline, canShowInstallPrompt, getPWAInstallPrompt, checkServiceWorkerStatus } from '../../utils/pwa'
import { isFeatureEnabled } from '../../utils/featureFlags'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { useStats } from '../../contexts/StatsContext'
import { logger } from '../../utils/logger'
import Card from '../shared/Card'
import StackConfigCard from './StackConfigCard'
import CustomStacksCard from './CustomStacksCard'
import PreferencesCard from './PreferencesCard'
import CookiePreferencesCard from './CookiePreferencesCard'
import DataManagementCard from './DataManagementCard'
import AboutCard from './AboutCard'
import SupportCard from './SupportCard'

export default function SettingsView() {
  const { 
    stackType, setStackType, 
    cardInterval, setCardInterval, 
    darkMode, setDarkMode, 
    soundEnabled, setSoundEnabled 
  } = useAppSettings()
  const { resetStats } = useStats()
  const [canInstall, setCanInstall] = createSignal(false)
  const [isInstalled, setIsInstalled] = createSignal(false)
  const [onlineStatus, setOnlineStatus] = createSignal(true)
  const [installing, setInstalling] = createSignal(false)


  onMount(() => {
    // Only run PWA logic if the feature is enabled
    if (isFeatureEnabled('pwaEnabled')) {
      // Initial checks
      const checkPWAStatus = async () => {
        const installed = isPWAInstalled()
        const installable = isPWAInstallable()
        const hasPrompt = !!getPWAInstallPrompt()
        const canShow = canShowInstallPrompt()
        const swStatus = await checkServiceWorkerStatus()
        
        setIsInstalled(installed)
        setCanInstall(canShow)
        
        logger.log('PWA Status Check:', {
          installed,
          installable,
          hasPrompt,
          canShow,
          userAgent: navigator.userAgent,
          serviceWorkerStatus: swStatus
        })
      }

      // Initial check
      checkPWAStatus()
      setOnlineStatus(isOnline())

      // Listen for online status changes
      window.addEventListener('online', () => {
        setOnlineStatus(true)
        checkPWAStatus()
      })
      window.addEventListener('offline', () => {
        setOnlineStatus(false)
        checkPWAStatus()
      })

      // Listen for beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', () => {
        logger.log('beforeinstallprompt event fired!')
        checkPWAStatus()
      })

      // Listen for appinstalled event
      window.addEventListener('appinstalled', () => {
        logger.log('appinstalled event fired!')
        checkPWAStatus()
      })

      // Check again after a delay to catch any delayed events
      setTimeout(checkPWAStatus, 2000)
    }
  })

  const handleInstall = async () => {
    if (!isFeatureEnabled('pwaEnabled')) return
    
    setInstalling(true)
    try {
      const success = await installPWA()
      if (success) {
        setIsInstalled(true)
        setCanInstall(false)
      }
    } catch (error) {
      logger.error('Installation failed:', error)
    } finally {
      setInstalling(false)
    }
  }

  const handleManualInstall = () => {
    if (!isFeatureEnabled('pwaEnabled')) return
    
    // For mobile Chrome, try to trigger the install banner
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        logger.log('Service Worker ready, trying to trigger install banner')
        // This might trigger the install banner on mobile Chrome
        window.dispatchEvent(new Event('beforeinstallprompt'))
      })
    }
  }

  const isMobileChrome = () => {
    const userAgent = navigator.userAgent
    return /Android/.test(userAgent) && /Chrome/.test(userAgent) && !/Edge/.test(userAgent)
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
        {/* App Installation - PWA Card (keeping inline due to complexity) */}
        <Show when={isFeatureEnabled('pwaEnabled')}>
          <Card icon="📱" title="App Installation" class="pwa-card">
            <div class="status-indicator">
              <span class={`status-dot ${onlineStatus() ? 'online' : 'offline'}`}></span>
              <span class="status-text">{onlineStatus() ? 'Online' : 'Offline'}</span>
            </div>
            
            <Show when={isInstalled()}>
              <div class="pwa-status installed">
                ✅ App installed and ready for offline use
              </div>
            </Show>
            
            <Show when={canInstall() && !isInstalled()}>
              <button 
                class="install-button" 
                onClick={handleInstall}
                disabled={installing()}
              >
                {installing() ? 'Installing...' : '📱 Install App'}
              </button>
              <div class="install-hint">
                Install for offline access and native app experience
              </div>
            </Show>
            
            <Show when={!canInstall() && !isInstalled()}>
              <div class="pwa-status not-supported">
                ℹ️ Installation not available
              </div>
              
              <Show when={isMobileChrome()}>
                <div class="mobile-install-options">
                  <h4>📱 Mobile Chrome Options:</h4>
                  <ol>
                    <li>Look for install banner at bottom</li>
                    <li>Tap menu (⋮) → "Install app"</li>
                    <li>Refresh and wait 30+ seconds</li>
                  </ol>
                  <button 
                    class="secondary-button" 
                    onClick={handleManualInstall}
                  >
                    🔄 Try Manual Trigger
                  </button>
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
