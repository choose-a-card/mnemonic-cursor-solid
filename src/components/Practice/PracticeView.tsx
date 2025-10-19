import { createSignal, Show } from 'solid-js'
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

export default function PracticeView() {
  const [currentMode, setCurrentMode] = createSignal<string>('selection')

  const selectMode = (modeId: string): void => {
    setCurrentMode(modeId)
  }

  const goBack = (): void => {
    setCurrentMode('selection')
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
