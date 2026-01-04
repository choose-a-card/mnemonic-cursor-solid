import { Show } from 'solid-js'
import Button from '../shared/Button'
import { createKeyboardHandler } from '../../hooks/useKeyboardHandler'
import { logger } from '../../utils/logger'
import './DebugControls.css'

interface DebugControlsProps {
  debugMode: boolean;
  onGenerateDebugStats: () => void;
}

export default function DebugControls(props: DebugControlsProps) {
  const handleDebugClick = () => {
    logger.log('Debug button clicked, debugMode:', props.debugMode)
    if (props.debugMode && props.onGenerateDebugStats) {
      logger.log('Calling generateDebugStats')
      props.onGenerateDebugStats()
    } else {
      logger.log('generateDebugStats is not available')
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
