import './SettingsView.css'
import type { CardInterval } from '../../types'
import { createSignal, onMount, Show } from 'solid-js'
import { isPWAInstallable, isPWAInstalled, installPWA, isOnline, canShowInstallPrompt, getPWAInstallPrompt, checkServiceWorkerStatus, forceServiceWorkerRegistration } from '../../utils/pwa'
import { isFeatureEnabled } from '../../utils/featureFlags'

interface SettingsViewProps {
  stackType: string;
  setStackType: (type: string) => void;
  cardInterval: CardInterval;
  setCardInterval: (interval: CardInterval) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onResetStats: () => void;
}

export default function SettingsView(props: SettingsViewProps) {
  const [canInstall, setCanInstall] = createSignal(false)
  const [isInstalled, setIsInstalled] = createSignal(false)
  const [onlineStatus, setOnlineStatus] = createSignal(true)
  const [installing, setInstalling] = createSignal(false)
  const [debugInfo, setDebugInfo] = createSignal<any>({})

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
        
        setDebugInfo({
          installed,
          installable,
          hasPrompt,
          canShow,
          userAgent: navigator.userAgent,
          isOnline: isOnline(),
          serviceWorkerStatus: swStatus
        })
        
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

  const handleForceSWRegistration = async () => {
    if (!isFeatureEnabled('pwaEnabled')) return
    
    console.log('Forcing service worker registration...')
    const success = await forceServiceWorkerRegistration()
    if (success) {
      // Recheck PWA status after registration
      setTimeout(async () => {
        const checkPWAStatus = async () => {
          const installed = isPWAInstalled()
          const installable = isPWAInstallable()
          const hasPrompt = !!getPWAInstallPrompt()
          const canShow = canShowInstallPrompt()
          const swStatus = await checkServiceWorkerStatus()
          
          setIsInstalled(installed)
          setCanInstall(canShow)
          
          setDebugInfo({
            installed,
            installable,
            hasPrompt,
            canShow,
            userAgent: navigator.userAgent,
            isOnline: isOnline(),
            serviceWorkerStatus: swStatus
          })
        }
        await checkPWAStatus()
      }, 1000)
    }
  }

  const isMobileChrome = () => {
    const userAgent = navigator.userAgent
    return /Android/.test(userAgent) && /Chrome/.test(userAgent) && !/Edge/.test(userAgent)
  }

  return (
    <div class="settings-view">
      <Show when={isFeatureEnabled('pwaEnabled')}>
        <div class="settings-section">
          <h3 class="section-title">📱 App Installation</h3>
        
        <div class="settings-block">
          <div class="settings-row">
            <div class="settings-label">Install App</div>
            <div class="status-indicator">
              <span class={`status-dot ${onlineStatus() ? 'online' : 'offline'}`}></span>
              <span class="status-text">{onlineStatus() ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          <Show when={isInstalled()}>
            <div class="pwa-status installed">
              ✅ App is installed and can work offline
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
            <div class="settings-hint">
              Install this app on your device to use it offline and access it like a native app.
            </div>
          </Show>
          
          <Show when={!canInstall() && !isInstalled()}>
            <div class="pwa-status not-supported">
              ℹ️ App installation not available
            </div>
            
            <Show when={isMobileChrome()}>
              <div class="mobile-install-options">
                <h4>📱 Mobile Chrome Installation Options:</h4>
                <ol>
                  <li>Look for the install banner at the bottom of the screen</li>
                  <li>Tap the menu (⋮) → "Install app"</li>
                  <li>Try refreshing the page and wait 30+ seconds</li>
                  <li>Navigate between different tabs in the app</li>
                </ol>
                <button 
                  class="secondary-button" 
                  onClick={handleManualInstall}
                >
                  🔄 Try Manual Trigger
                </button>
                <button 
                  class="secondary-button" 
                  onClick={handleForceSWRegistration}
                >
                  🔧 Force Service Worker Registration
                </button>
              </div>
            </Show>
            
            <div class="debug-info">
              <details>
                <summary>Debug Info</summary>
                <pre>{JSON.stringify(debugInfo(), null, 2)}</pre>
              </details>
            </div>
            <div class="settings-hint">
              Try refreshing the page or check if you're using a supported browser (Chrome, Edge, Safari).
            </div>
          </Show>
        </div>
      </div>
      </Show>

      <div class="settings-section">
        <h3 class="section-title">🎴 Stack Configuration</h3>
        
        <div class="settings-block">
          <div class="settings-label">Stack Type</div>
          <div class="settings-options">
            <button
              class={props.stackType === 'tamariz' ? 'active' : ''}
              onClick={() => props.setStackType('tamariz')}
            >
              Tamariz
            </button>
            <button
              class={props.stackType === 'aronson' ? 'active' : ''}
              onClick={() => props.setStackType('aronson')}
            >
              Aronson
            </button>
            <button
              class={props.stackType === 'faro' ? 'active' : ''}
              onClick={() => props.setStackType('faro')}
            >
              5th Faro
            </button>
          </div>
        </div>

        <div class="settings-block">
          <div class="settings-label">Practice Range</div>
          <div class="range-slider-container">
            <div class="range-slider">
              <input
                type="range"
                min="1"
                max="52"
                value={props.cardInterval.start}
                onInput={e => props.setCardInterval({ 
                  ...props.cardInterval, 
                  start: Number(e.target.value) 
                })}
                class="range-slider-input start-slider"
              />
              <input
                type="range"
                min="1"
                max="52"
                value={props.cardInterval.end}
                onInput={e => props.setCardInterval({ 
                  ...props.cardInterval, 
                  end: Number(e.target.value) 
                })}
                class="range-slider-input end-slider"
              />
            </div>
            <div class="range-labels">
              <span class="range-label">Start: {props.cardInterval.start}</span>
              <span class="range-label">End: {props.cardInterval.end}</span>
            </div>
          </div>
          <div class="settings-hint">
            Practice with cards from position {props.cardInterval.start} to {props.cardInterval.end} ({props.cardInterval.end - props.cardInterval.start + 1} cards)
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">🎨 Appearance</h3>
        
        <div class="settings-block">
          <div class="settings-row">
            <div class="settings-label">Dark Mode</div>
            <button 
              class={`toggle-switch ${props.darkMode ? 'active' : ''}`}
              onClick={() => props.setDarkMode(!props.darkMode)}
            >
              <div class="toggle-slider"></div>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">🔊 Audio</h3>
        
        <div class="settings-block">
          <div class="settings-row">
            <div class="settings-label">Sound Effects</div>
            <button 
              class={`toggle-switch ${props.soundEnabled ? 'active' : ''}`}
              onClick={() => props.setSoundEnabled(!props.soundEnabled)}
            >
              <div class="toggle-slider"></div>
            </button>
          </div>
          <div class="settings-hint">
            Play sounds for correct/incorrect answers
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">📊 Data</h3>
        
        <div class="settings-block">
          <button class="settings-reset" onClick={props.onResetStats}>
            🗑️ Reset All Statistics
          </button>
          <div class="settings-hint">
            This will permanently delete all your progress data
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">ℹ️ About</h3>
        
        <div class="settings-block">
          <div class="about-info">
            <div class="app-name">Mnemonic Stack Trainer</div>
            <div class="app-version">Version 1.0.0</div>
            <div class="app-description">
              Practice and master the Tamariz, Aronson, and 5th Faro card stacks with multiple training modes and detailed analytics.
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">☕ Support</h3>
        
        <div class="settings-block">
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
  )
} 