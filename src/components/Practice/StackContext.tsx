import { onMount } from 'solid-js'
import { getRandomInt } from '../../utils/utils';
import CardKeyboard from '../shared/CardKeyboard'
import CardText from '../shared/CardText'
import { useCardQuiz } from '../../hooks/useCardQuiz'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'

export default function StackContext() {
  const { practiceStack, soundEnabled, onResult } = usePractice()
  
  const quiz = useCardQuiz({
    soundEnabled: soundEnabled(),
    onResult: onResult,
    mode: 'Stack Context'
  })

  function nextQuestion(): void {
    // Pick a random card from the practice stack
    const practiceIdx = getRandomInt(practiceStack().length)
    const card = practiceStack()[practiceIdx]
    const contextType = Math.random() > 0.5 ? 'previous' : 'next'
    
    if (contextType === 'previous' && practiceIdx > 0) {
      const prevCard = practiceStack()[practiceIdx - 1]
      quiz.updateQuestion({ card, answer: prevCard, type: 'context-prev' })
    } else if (contextType === 'next' && practiceIdx < practiceStack().length - 1) {
      const nextCard = practiceStack()[practiceIdx + 1]
      quiz.updateQuestion({ card, answer: nextCard, type: 'context-next' })
    } else {
      // Fallback to next if at beginning or previous if at end
      const fallbackIdx = practiceIdx === 0 ? practiceIdx + 1 : practiceIdx - 1
      const fallbackCard = practiceStack()[fallbackIdx]
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

  const questionPrefix = () => {
    const q = quiz.question()
    return q.type === 'context-prev' ? 'What card comes before' : 'What card comes after'
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="question-text">{questionPrefix()} <CardText card={quiz.question().card || ''} />?</div>
      </div>
      
      {/* Answer Form */}
      <form class="answer-form" onSubmit={handleSubmit}>
        <div class="input-container">
          <input
            class="answer-input"
            type="text"
            value={quiz.input()}
            placeholder="Enter card"
            aria-label="Card selection (use keyboard below)"
            readonly
            inputmode="none"
          />
          
          <CardKeyboard
            isVisible={true}
            onClose={() => {}}
            onCardSelect={handleCardSelect}
            onPartialSelect={handlePartialSelect}
          />
        </div>

        <div class="feedback-area">
          {quiz.feedback() && (
            <div 
              class="feedback-message"
              classList={{ 
                'feedback-correct': quiz.isCorrect(),
                'feedback-error': !quiz.isCorrect()
              }}
            >
              {quiz.feedback()}
              {quiz.feedbackCard() && <CardText card={quiz.feedbackCard()!} />}
            </div>
          )}
        </div>
      </form>
    </div>
  )
} 