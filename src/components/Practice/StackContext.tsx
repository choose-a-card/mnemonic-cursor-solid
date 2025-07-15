import { onMount } from 'solid-js'
import { getRandomInt } from '../../utils/utils';
import CardKeyboard from '../shared/CardKeyboard'
import { useCardQuiz } from '../../hooks/useCardQuiz'
import type { QuizResult, CardInterval } from '../../types'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'

interface StackContextProps {
  stack: string[];
  practiceStack: string[];
  cardInterval: CardInterval;
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
}

export default function StackContext(props: StackContextProps) {
  const quiz = useCardQuiz({
    soundEnabled: props.soundEnabled,
    onResult: props.onResult,
    mode: 'Stack Context'
  })

  function nextQuestion(): void {
    // Pick a random card from the practice stack
    const practiceIdx = getRandomInt(props.practiceStack.length)
    const card = props.practiceStack[practiceIdx]
    const contextType = Math.random() > 0.5 ? 'previous' : 'next'
    
    if (contextType === 'previous' && practiceIdx > 0) {
      const prevCard = props.practiceStack[practiceIdx - 1]
      quiz.updateQuestion({ card, answer: prevCard, type: 'context-prev' })
    } else if (contextType === 'next' && practiceIdx < props.practiceStack.length - 1) {
      const nextCard = props.practiceStack[practiceIdx + 1]
      quiz.updateQuestion({ card, answer: nextCard, type: 'context-next' })
    } else {
      // Fallback to next if at beginning or previous if at end
      const fallbackIdx = practiceIdx === 0 ? practiceIdx + 1 : practiceIdx - 1
      const fallbackCard = props.practiceStack[fallbackIdx]
      const fallbackType = practiceIdx === 0 ? 'context-next' : 'context-prev'
      quiz.updateQuestion({ card, answer: fallbackCard, type: fallbackType })
    }
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

  function getQuestionText(): string {
    const q = quiz.question()
    if (q.type === 'context-prev') {
      return `What card comes before ${q.card}?`
    } else {
      return `What card comes after ${q.card}?`
    }
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="question-text">{getQuestionText()}</div>
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