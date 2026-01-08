import { Show, createMemo } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import './PracticeView.css'
import ClassicQuiz from './ClassicQuiz'
import PositionToCard from './PositionToCard'
import OneAhead from './OneAhead'
import StackContext from './StackContext'
import CuttingEstimation from './CuttingEstimation'
import FirstOrSecondHalf from './FirstOrSecondHalf'
import QuartetPosition from './QuartetPosition'
import CutToPosition from './CutToPosition'
import PracticeModeSelector from './PracticeModeSelector'
import PracticeHeader from './PracticeHeader'
import { PracticeProvider } from '../../contexts/PracticeContext'
import { trackEvent } from '../../utils/analytics'
import { PRACTICE_MODES } from '../../constants/practiceModes'

interface PracticeViewProps {
  modeId?: string
}

export default function PracticeView(props: PracticeViewProps) {
  const navigate = useNavigate()
  
  // Determine current mode from URL parameter
  const currentMode = createMemo(() => {
    const modeId = props.modeId
    if (!modeId) return 'selection'
    
    // Validate that the modeId exists in our practice modes
    const isValidMode = PRACTICE_MODES.some(m => m.id === modeId)
    return isValidMode ? modeId : 'selection'
  })

  const selectMode = (modeId: string): void => {
    // Navigate to the practice mode URL - this will trigger automatic route tracking
    navigate(`/practice/${modeId}`)
    
    // Track practice mode selection as a custom event
    const mode = PRACTICE_MODES.find(m => m.id === modeId)
    if (mode) {
      trackEvent('practice_mode_selected', {
        mode_id: modeId,
        mode_name: mode.name,
      })
    }
  }

  const goBack = (): void => {
    const previousMode = currentMode()
    
    // Navigate back to practice selector - this will trigger automatic route tracking
    navigate('/practice')
    
    // Track returning to mode selector
    trackEvent('practice_mode_exited', {
      previous_mode: previousMode,
    })
  }

  return (
    <PracticeProvider>
      <div class="practice-view">
        <Show when={currentMode() === 'selection'}>
          <PracticeModeSelector onModeSelect={selectMode} />
        </Show>

        <Show when={currentMode() !== 'selection'}>
          <PracticeHeader currentModeId={currentMode()} onBack={goBack} />
          
          <div class="practice-content">
            <Show when={currentMode() === 'card-to-pos'}>
              <ClassicQuiz />
            </Show>
            
            <Show when={currentMode() === 'pos-to-card'}>
              <PositionToCard />
            </Show>
            
            <Show when={currentMode() === 'one-ahead'}>
              <OneAhead />
            </Show>
            
            <Show when={currentMode() === 'context'}>
              <StackContext />
            </Show>
            
            <Show when={currentMode() === 'cutting'}>
              <CuttingEstimation />
            </Show>
            
            <Show when={currentMode() === 'first-or-second-half'}>
              <FirstOrSecondHalf />
            </Show>
            
            <Show when={currentMode() === 'quartet-position'}>
              <QuartetPosition />
            </Show>
            
            <Show when={currentMode() === 'cut-to-position'}>
              <CutToPosition />
            </Show>
          </div>
        </Show>
      </div>
    </PracticeProvider>
  )
}
