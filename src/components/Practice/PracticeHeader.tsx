import { Show } from 'solid-js'
import { PRACTICE_MODES } from '../../constants/practiceModes'
import { createKeyboardHandler } from '../../hooks/useKeyboardHandler'
import './PracticeHeader.css'

interface PracticeHeaderProps {
  currentModeId: string;
  onBack: () => void;
}

export default function PracticeHeader(props: PracticeHeaderProps) {
  const currentModeInfo = () => PRACTICE_MODES.find(m => m.id === props.currentModeId)

  return (
    <div class="practice-header">
      <button 
        class="back-button" 
        onClick={props.onBack}
        onKeyDown={createKeyboardHandler(props.onBack)}
        type="button"
        aria-label="Go back to practice mode selection"
        tabindex={0}
      >
        ← Back
      </button>
      <div class="practice-title">
        <Show when={currentModeInfo()}>
          <span class="practice-icon" aria-hidden="true">{currentModeInfo()?.icon}</span>
          <span class="practice-name">{currentModeInfo()?.name}</span>
        </Show>
      </div>
    </div>
  )
}

