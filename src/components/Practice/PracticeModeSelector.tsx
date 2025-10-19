import { For, Show, createMemo } from 'solid-js'
import { PRACTICE_MODES, type PracticeMode } from '../../constants/practiceModes'
import { useStats } from '../../contexts/StatsContext'
import { isFeatureEnabled } from '../../utils/featureFlags'
import { createKeyboardHandler } from '../../hooks/useKeyboardHandler'
import { getModeStats } from '../../utils/statsCalculations'
import './PracticeModeSelector.css'

interface PracticeModeSelectorProps {
  onModeSelect: (modeId: string) => void;
}

export default function PracticeModeSelector(props: PracticeModeSelectorProps) {
  const { stats, badges } = useStats()

  // Calculate badge progress for motivation
  const badgeProgress = createMemo(() => {
    const allBadges = badges()
    const unlockedCount = allBadges.filter(b => b.unlocked).length
    const totalCount = allBadges.length
    const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
    
    return { unlockedCount, totalCount, percentage }
  })

  const handleModeClick = (modeId: string, event?: MouseEvent) => {
    // Remove focus on touch devices to prevent stuck hover state
    if (event && 'ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    props.onModeSelect(modeId)
  }

  return (
    <div class="practice-mode-selector">
      <div class="selection-header">
        <h2 class="selection-title">Choose Practice Mode</h2>
        <p class="selection-subtitle">Select the type of practice you want to focus on</p>
        
        {/* Badge Progress Indicator - only show if badges are enabled */}
        <Show when={isFeatureEnabled('badgesEnabled')}>
          <div class="badge-progress-indicator">
            <div class="badge-progress-info">
              <span class="badge-progress-icon">🏆</span>
              <span class="badge-progress-text">
                {badgeProgress().unlockedCount} of {badgeProgress().totalCount} badges unlocked
              </span>
            </div>
            <div class="badge-progress-bar-mini">
              <div 
                class="badge-progress-fill-mini" 
                style={{ width: `${badgeProgress().percentage}%` }}
              ></div>
            </div>
          </div>
        </Show>
      </div>
      
      <div class="mode-list" role="listbox" aria-label="Practice modes">
        <For each={PRACTICE_MODES}>
          {(mode: PracticeMode) => {
            const modeStats = getModeStats(stats(), mode.name)
            
            return (
              <button 
                class="mode-card"
                onClick={(e) => handleModeClick(mode.id, e)}
                onKeyDown={createKeyboardHandler(() => handleModeClick(mode.id))}
                type="button"
                role="option"
                tabindex={0}
                aria-label={`${mode.name}: ${mode.description}. ${modeStats.total > 0 ? `${modeStats.accuracy}% accuracy from ${modeStats.total} attempts` : 'No attempts yet'}`}
              >
                <div class="mode-icon" aria-hidden="true">{mode.icon}</div>
                <div class="mode-content">
                  <div class="mode-name">{mode.name}</div>
                  <div class="mode-description">{mode.description}</div>
                  {modeStats.total > 0 && (
                    <div class="mode-stats">
                      <span class="mode-accuracy">{modeStats.accuracy}% accuracy</span>
                      <span class="mode-attempts">({modeStats.total} attempts)</span>
                    </div>
                  )}
                </div>
                <div class="mode-arrow" aria-hidden="true">→</div>
              </button>
            )
          }}
        </For>
      </div>
    </div>
  )
}

