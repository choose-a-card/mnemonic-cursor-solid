import { Show, createMemo, createEffect, onCleanup } from 'solid-js'
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
import PlopDenisBehr from './PlopDenisBehr'
import PracticeModeSelector from './PracticeModeSelector'
import PracticeHeader from './PracticeHeader'
import { PracticeProvider } from '../../contexts/PracticeContext'
import { trackEvent } from '../../utils/analytics'
import { PRACTICE_SESSION_ENDED } from '../../constants/analyticsEvents'
import { PRACTICE_MODES } from '../../constants/practiceModes'

interface PracticeViewProps {
  modeId?: string
}

export default function PracticeView(props: PracticeViewProps) {
  const navigate = useNavigate()

  // Track practice session duration per mode
  let sessionStartTime: number | null = null
  let sessionMode: string | null = null

  const endSession = (): void => {
    if (!sessionStartTime || !sessionMode) return

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000)
    trackEvent(PRACTICE_SESSION_ENDED, {
      mode: sessionMode,
      duration_seconds: durationSeconds,
    })

    sessionStartTime = null
    sessionMode = null
  }
  
  // Determine current mode from URL parameter
  const currentMode = createMemo(() => {
    const modeId = props.modeId
    if (!modeId) return 'selection'
    
    // Validate that the modeId exists in our practice modes
    const isValidMode = PRACTICE_MODES.some(m => m.id === modeId)
    return isValidMode ? modeId : 'selection'
  })

  // Start/end session timer when mode changes
  createEffect(() => {
    const mode = currentMode()

    // End previous session if there was one
    endSession()

    // Start new session if entering a practice mode
    if (mode !== 'selection') {
      sessionStartTime = Date.now()
      sessionMode = mode
    }
  })

  // End session if the component unmounts (user navigates away entirely)
  onCleanup(() => {
    endSession()
  })

  const selectMode = (modeId: string): void => {
    // Navigate to the practice mode URL — page view tracking handles analytics automatically
    navigate(`/practice/${modeId}`)
  }

  const goBack = (): void => {
    // Navigate back to practice selector — page view tracking handles analytics automatically
    navigate('/practice')
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
            
            <Show when={currentMode() === 'plop-denis-behr'}>
              <PlopDenisBehr />
            </Show>
          </div>
        </Show>
      </div>
    </PracticeProvider>
  )
}
