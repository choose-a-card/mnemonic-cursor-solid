import './SettingsView.css'

export default function SettingsView(props) {
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
          <div class="settings-label">Number of Cards to Practice</div>
          <div class="number-input-container">
            <input
              class="settings-input"
              type="number"
              min="1"
              max="52"
              value={props.numCards}
              onInput={e => props.setNumCards(Number(e.target.value))}
            />
            <span class="input-suffix">cards</span>
          </div>
          <div class="settings-hint">
            Practice with the first N cards of the stack
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
    </div>
  )
} 