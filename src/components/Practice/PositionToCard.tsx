import { onMount } from 'solid-js'
import { getRandomInt } from '../../utils/utils';
import CardKeyboard from '../shared/CardKeyboard'
import { useCardQuiz } from '../../hooks/useCardQuiz'
import type { QuizResult, CardInterval } from '../../types'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'

interface PositionToCardProps {
  stack: string[];
  practiceStack: string[];
  cardInterval: CardInterval;
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
}

export default function PositionToCard(props: PositionToCardProps) {
  const quiz = useCardQuiz({
    soundEnabled: props.soundEnabled,
    onResult: props.onResult,
    mode: 'Position → Card'
  })

  function nextQuestion(): void {
    // Pick a random position from the practice range
    const practiceIdx = getRandomInt(props.practiceStack.length)
    const card = props.practiceStack[practiceIdx]
    const actualPos = props.cardInterval.start + practiceIdx
    
    quiz.updateQuestion({ pos: actualPos, answer: card, type: 'pos-to-card' })
  }

  function submitAndContinue(): void {
    quiz.submitAnswer()
    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  function handleSubmit(e: Event): void {
    e.preventDefault()
    submitAndContinue()
  }

  function handleCardSelect(card: string): void {
    quiz.setInput(card)
    setTimeout(() => {
      submitAndContinue()
    }, 100)
  }

  function handlePartialSelect(partial: string): void {
    quiz.setInput(partial)
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="question-text">What card is at position {quiz.question().pos}?</div>
      </div>
      
      {/* Answer Form */}
      <form class="answer-form" onSubmit={handleSubmit}>
        <div class="input-container">
          <input
            class="answer-input"
            type="text"
            value={quiz.input()}
            onInput={e => quiz.setInput((e.target as HTMLInputElement).value)}
            onFocus={() => quiz.setShowKeyboard(true)}
            placeholder="Enter card"
            required
            autofocus
            readonly
          />
          
          <CardKeyboard
            isVisible={quiz.showKeyboard()}
            onClose={() => quiz.setShowKeyboard(false)}
            onCardSelect={handleCardSelect}
            onPartialSelect={handlePartialSelect}
          />
        </div>

        <div class="feedback-area">
          {quiz.feedback() && (
            <div class="feedback-message">{quiz.feedback()}</div>
          )}
        </div>
      </form>
    </div>
  )
} 