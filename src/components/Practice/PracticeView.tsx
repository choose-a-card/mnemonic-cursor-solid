import { createSignal, Show } from 'solid-js'
import './PracticeView.css'
import ClassicQuiz from './ClassicQuiz'
import PositionToCard from './PositionToCard'
import OneAhead from './OneAhead'
import StackContext from './StackContext'
import CuttingEstimation from './CuttingEstimation'
import type { QuizResult, CardInterval } from '../../types'
import FirstOrSecondHalf from './FirstOrSecondHalf'
import QuartetPosition from './QuartetPosition'
import CutToPosition from './CutToPosition'
import { useStats } from '../../contexts/StatsContext'

interface PracticeViewProps {
  stack: string[];
  practiceStack: string[];
  cardInterval: CardInterval;
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
}

interface PracticeMode {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PRACTICE_MODES: PracticeMode[] = [
  { 
    id: 'card-to-pos', 
    name: 'Card → Position', 
    icon: '🎯', 
    description: 'Given a card, identify its position in the stack'
  },
  { 
    id: 'pos-to-card', 
    name: 'Position → Card', 
    icon: '🔍', 
    description: 'Given a position, identify which card is there'
  },
  { 
    id: 'one-ahead', 
    name: 'One Ahead', 
    icon: '⏭️', 
    description: 'Given a card, predict what card comes next in the stack'
  },
  { 
    id: 'context', 
    name: 'Stack Context', 
    icon: '🔗', 
    description: 'Practice knowing which cards come before and after any given card'
  },
  { 
    id: 'cutting', 
    name: 'Cutting Estimation', 
    icon: '✂️', 
    description: 'Estimate how many cards to cut to reach a target card from any position'
  },
  { 
    id: 'first-or-second-half', 
    name: 'First or Second Half', 
    icon: '🃏', 
    description: 'Given a card, say if it is in the first (1-26) or second (27-52) half of the deck'
  },
  { 
    id: 'quartet-position', 
    name: 'Quartet Position', 
    icon: '4️⃣', 
    description: 'Enter the positions of all four cards of a given rank (e.g., all 7s)'
  },
  { 
    id: 'cut-to-position', 
    name: 'Cut to Position', 
    icon: '🔀', 
    description: 'Given a target card and position, enter the cut card needed to put the target at that position'
  },
]

export default function PracticeView(props: PracticeViewProps) {
  const [currentMode, setCurrentMode] = createSignal<string>('selection')
  const { stats } = useStats()

  const selectMode = (modeId: string): void => {
    console.log('PracticeView: selectMode called with:', modeId)
    setCurrentMode(modeId)
    console.log('PracticeView: currentMode set to:', currentMode())
  }

  const goBack = (): void => {
    console.log('PracticeView: goBack called')
    setCurrentMode('selection')
  }

  const getModeAccuracy = (modeName: string): number => {
    const modeStats = stats().modeStats[modeName]
    return modeStats ? modeStats.accuracy : 0
  }

  const getModeAttempts = (modeName: string): number => {
    const modeStats = stats().modeStats[modeName]
    return modeStats ? modeStats.total : 0
  }

  const handleModeClick = (modeId: string) => {
    console.log('PracticeView: Button clicked for mode:', modeId)
    selectMode(modeId)
  }

  const handleKeyDown = (event: KeyboardEvent, modeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleModeClick(modeId)
    }
  }

  const handleBackClick = () => {
    goBack()
  }

  const handleBackKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBackClick()
    }
  }

  console.log('PracticeView: Rendering with currentMode:', currentMode())

  return (
    <div class="practice-view">
      <Show when={currentMode() === 'selection'}>
        <div class="selection-header">
          <h2 class="selection-title">Choose Practice Mode</h2>
          <p class="selection-subtitle">Select the type of practice you want to focus on</p>
        </div>
        
        <div class="mode-list" role="listbox" aria-label="Practice modes">
          {PRACTICE_MODES.map(mode => {
            const accuracy = getModeAccuracy(mode.name)
            const attempts = getModeAttempts(mode.name)
            
            return (
              <button 
                class="mode-card"
                onClick={() => handleModeClick(mode.id)}
                onKeyDown={(e) => handleKeyDown(e, mode.id)}
                type="button"
                role="option"
                tabindex={0}
                aria-label={`${mode.name}: ${mode.description}. ${attempts > 0 ? `${accuracy}% accuracy from ${attempts} attempts` : 'No attempts yet'}`}
              >
                <div class="mode-icon" aria-hidden="true">{mode.icon}</div>
                <div class="mode-content">
                  <div class="mode-name">{mode.name}</div>
                  <div class="mode-description">{mode.description}</div>
                  {attempts > 0 && (
                    <div class="mode-stats">
                      <span class="mode-accuracy">{accuracy}% accuracy</span>
                      <span class="mode-attempts">({attempts} attempts)</span>
                    </div>
                  )}
                </div>
                <div class="mode-arrow" aria-hidden="true">→</div>
              </button>
            )
          })}
        </div>
      </Show>

      <Show when={currentMode() !== 'selection'}>
        {(() => {
          console.log('PracticeView: Rendering practice mode for:', currentMode())
          const currentModeInfo = PRACTICE_MODES.find(m => m.id === currentMode())
          console.log('PracticeView: currentModeInfo:', currentModeInfo)
          
          return (
            <>
              {/* Practice Header */}
              <div class="practice-header">
                <button 
                  class="back-button" 
                  onClick={handleBackClick}
                  onKeyDown={handleBackKeyDown}
                  type="button"
                  aria-label="Go back to practice mode selection"
                  tabindex={0}
                >
                  ← Back
                </button>
                <div class="practice-title">
                  <span class="practice-icon" aria-hidden="true">{currentModeInfo?.icon}</span>
                  <span class="practice-name">{currentModeInfo?.name}</span>
                </div>
              </div>

              {/* Render the appropriate practice component */}
              <div class="practice-content">
                <Show when={currentMode() === 'card-to-pos'}>
                  {(() => {
                    console.log('PracticeView: Rendering ClassicQuiz component')
                    return (
                      <ClassicQuiz 
                        stack={props.stack}
                        practiceStack={props.practiceStack}
                        cardInterval={props.cardInterval}
                        soundEnabled={props.soundEnabled}
                        onResult={props.onResult}
                      />
                    )
                  })()}
                </Show>
                
                <Show when={currentMode() === 'pos-to-card'}>
                  {(() => {
                    console.log('PracticeView: Rendering PositionToCard component')
                    return (
                      <PositionToCard 
                        stack={props.stack}
                        practiceStack={props.practiceStack}
                        cardInterval={props.cardInterval}
                        soundEnabled={props.soundEnabled}
                        onResult={props.onResult}
                      />
                    )
                  })()}
                </Show>
                
                <Show when={currentMode() === 'one-ahead'}>
                  {(() => {
                    console.log('PracticeView: Rendering OneAhead component')
                    return (
                      <OneAhead 
                        stack={props.stack}
                        practiceStack={props.practiceStack}
                        cardInterval={props.cardInterval}
                        soundEnabled={props.soundEnabled}
                        onResult={props.onResult}
                      />
                    )
                  })()}
                </Show>
                
                <Show when={currentMode() === 'context'}>
                  {(() => {
                    console.log('PracticeView: Rendering StackContext component')
                    return (
                      <StackContext 
                        stack={props.stack}
                        practiceStack={props.practiceStack}
                        cardInterval={props.cardInterval}
                        soundEnabled={props.soundEnabled}
                        onResult={props.onResult}
                      />
                    )
                  })()}
                </Show>
                
                <Show when={currentMode() === 'cutting'}>
                  {(() => {
                    console.log('PracticeView: Rendering CuttingEstimation component')
                    return (
                      <CuttingEstimation 
                        stack={props.stack}
                        practiceStack={props.practiceStack}
                        cardInterval={props.cardInterval}
                        soundEnabled={props.soundEnabled}
                        onResult={props.onResult}
                      />
                    )
                  })()}
                </Show>
                <Show when={currentMode() === 'first-or-second-half'}>
                  <FirstOrSecondHalf
                    stack={props.stack}
                    practiceStack={props.practiceStack}
                    cardInterval={props.cardInterval}
                    soundEnabled={props.soundEnabled}
                    onResult={props.onResult}
                  />
                </Show>
                <Show when={currentMode() === 'quartet-position'}>
                  <QuartetPosition
                    stack={props.stack}
                    practiceStack={props.practiceStack}
                    cardInterval={props.cardInterval}
                    soundEnabled={props.soundEnabled}
                    onResult={props.onResult}
                  />
                </Show>
                <Show when={currentMode() === 'cut-to-position'}>
                  <CutToPosition
                    stack={props.stack}
                    practiceStack={props.practiceStack}
                    cardInterval={props.cardInterval}
                    soundEnabled={props.soundEnabled}
                    onResult={props.onResult}
                  />
                </Show>
              </div>
            </>
          )
        })()}
      </Show>
    </div>
  )
} 