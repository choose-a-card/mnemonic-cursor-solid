import './SettingsView.css'
import { createSignal, onMount, Show } from 'solid-js'
import { isPWAInstallable, isPWAInstalled, installPWA, isOnline, canShowInstallPrompt, getPWAInstallPrompt, checkServiceWorkerStatus } from '../../utils/pwa'
import { isFeatureEnabled } from '../../utils/featureFlags'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { useStats } from '../../contexts/StatsContext'
import DualRangeSlider from './DualRangeSlider'

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
        

        
        console.log('PWA Status Check:', {
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
        console.log('beforeinstallprompt event fired!')
        checkPWAStatus()
      })

      // Listen for appinstalled event
      window.addEventListener('appinstalled', () => {
        console.log('appinstalled event fired!')
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
      console.error('Installation failed:', error)
    } finally {
      setInstalling(false)
    }
  }

  const handleManualInstall = () => {
    if (!isFeatureEnabled('pwaEnabled')) return
    
    // For mobile Chrome, try to trigger the install banner
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker ready, trying to trigger install banner')
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
        {/* Stack Configuration */}
        <div class="settings-card stack-config">
          <div class="card-header">
            <div class="card-icon">🎴</div>
            <h3 class="card-title">Stack Configuration</h3>
          </div>
          <div class="card-content">
            <div class="setting-group">
              <label class="setting-label">Stack Type</label>
              <div class="stack-options">
                <button
                  class={`stack-option ${stackType() === 'tamariz' ? 'active' : ''}`}
                  onClick={() => setStackType('tamariz' as any)}
                >
                  <span class="option-name">Tamariz</span>
                </button>
                <button
                  class={`stack-option ${stackType() === 'aronson' ? 'active' : ''}`}
                  onClick={() => setStackType('aronson' as any)}
                >
                  <span class="option-name">Aronson</span>
                </button>
                <button
                  class={`stack-option ${stackType() === 'faro' ? 'active' : ''}`}
                  onClick={() => setStackType('faro' as any)}
                >
                  <span class="option-name">5th Faro</span>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">Practice Range</label>
              <div class="range-container">
                <DualRangeSlider
                  min={1}
                  max={52}
                  start={cardInterval().start}
                  end={cardInterval().end}
                  onRangeChange={(start, end) => {
                    setCardInterval({ start, end })
                  }}
                  step={1}
                />
                <div class="range-info">
                  <span class="range-text">Cards {cardInterval().start} - {cardInterval().end}</span>
                  <span class="range-count">({cardInterval().end - cardInterval().start + 1} cards)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div class="settings-card preferences">
          <div class="card-header">
            <div class="card-icon">⚙️</div>
            <h3 class="card-title">Preferences</h3>
          </div>
          <div class="card-content">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <label class="setting-label">Dark Mode</label>
                  <span class="setting-desc">Switch between light and dark themes</span>
                </div>
                <button 
                  class={`toggle-switch ${darkMode() ? 'active' : ''}`}
                  onClick={() => setDarkMode(!darkMode())}
                  type="button"
                  aria-label={`${darkMode() ? 'Disable' : 'Enable'} dark mode`}
                >
                  <div class="toggle-slider"></div>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <label class="setting-label">Sound Effects</label>
                  <span class="setting-desc">Audio feedback for answers</span>
                </div>
                <button 
                  class={`toggle-switch ${soundEnabled() ? 'active' : ''}`}
                  onClick={() => setSoundEnabled(!soundEnabled())}
                  type="button"
                  aria-label={`${soundEnabled() ? 'Disable' : 'Enable'} sound effects`}
                >
                  <div class="toggle-slider"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Section */}
      <div class="settings-sidebar">
        {/* App Installation */}
        <Show when={isFeatureEnabled('pwaEnabled')}>
          <div class="settings-card pwa-card">
            <div class="card-header">
              <div class="card-icon">📱</div>
              <h3 class="card-title">App Installation</h3>
            </div>
            <div class="card-content">
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
            </div>
          </div>
        </Show>

        {/* Data Management */}
        <div class="settings-card data-card">
          <div class="card-header">
            <div class="card-icon">📊</div>
            <h3 class="card-title">Data Management</h3>
          </div>
          <div class="card-content">
            <div class="setting-group">
              <div class="setting-info">
                <label class="setting-label">Reset Statistics</label>
                <span class="setting-desc">Permanently delete all progress data</span>
              </div>
              <button class="reset-button" onClick={resetStats}>
                🗑️ Reset All Data
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div class="settings-card about-card">
          <div class="card-header">
            <div class="card-icon">ℹ️</div>
            <h3 class="card-title">About</h3>
          </div>
          <div class="card-content">
            <div class="about-info">
              <div class="app-name">Mnemonic Stack Trainer</div>
              <div class="app-version">Version 1.0.0</div>
              <div class="app-description">
                Master the Tamariz, Aronson, and 5th Faro card stacks with multiple training modes and detailed analytics.
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div class="settings-card support-card">
          <div class="card-header">
            <div class="card-icon">☕</div>
            <h3 class="card-title">Support</h3>
          </div>
          <div class="card-content">
            <div class="support-info">
              <div class="support-text">
                If you find this app helpful for your card magic practice, consider supporting its development.
              </div>
              <a 
                href="https://buymeacoffee.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                class="support-button"
              >
                ☕ Buy Me a Coffee
              </a>
              <div class="support-hint">
                Your support helps keep this app free and continuously improved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 