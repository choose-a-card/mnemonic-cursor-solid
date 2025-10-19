import { Show } from 'solid-js'
import Button from '../shared/Button'
import { createKeyboardHandler } from '../../hooks/useKeyboardHandler'
import './DebugControls.css'

interface DebugControlsProps {
  debugMode: boolean;
  onGenerateDebugStats: () => void;
}

export default function DebugControls(props: DebugControlsProps) {
  const handleDebugClick = () => {
    console.log('Debug button clicked, debugMode:', props.debugMode)
    if (props.debugMode && props.onGenerateDebugStats) {
      console.log('Calling generateDebugStats')
      props.onGenerateDebugStats()
    } else {
      console.log('generateDebugStats is not available')
    }
  }

  return (
    <Show when={props.debugMode}>
      <div class="debug-section">
        <Button
          variant="secondary"
          onClick={handleDebugClick}
          onKeyDown={createKeyboardHandler(handleDebugClick)}
          ariaLabel="Generate 10000 debug results for testing"
        >
          🧪 Generate 10000 Debug Results
        </Button>
      </div>
    </Show>
  )
}

