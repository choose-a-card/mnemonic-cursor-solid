import './SettingsView.css'
import type { CardInterval } from '../../types'

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
  return (
    <div class="settings-view">
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