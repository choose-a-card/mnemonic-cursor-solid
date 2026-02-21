import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds'
import { getRandomInt } from '../../utils/utils'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'
import NumericKeyboard from '../shared/NumericKeyboard'

export default function ClassicQuiz() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)

  const nextQuestion = (): void => {
    setFeedback('')
    setInput('')
    setIsCorrect(false)

    const practiceIdx = getRandomInt(practiceStack().length)
    const card = practiceStack()[practiceIdx]
    const actualPos = cardInterval().start + practiceIdx

    setQuestion({ card, answer: actualPos, type: 'card-to-pos' })
  }

  const handleNumericDigit = (digit: string): void => {
    setInput(previous => previous + digit)
  }

  const handleNumericDelete = (): void => {
    setInput(previous => previous.slice(0, -1))
  }

  const handleNumericSubmit = (): void => {
    const currentQuestion = question()
    const correct = Number(input()) === currentQuestion.answer

    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)

    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${currentQuestion.answer}`)
    }

    onResult({
      correct,
      question: currentQuestion,
      input: input(),
      mode: 'Card → Position'
    })

    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="question-text">What position is <CardText card={question().card || ''} />?</div>
      </div>

      {/* Answer */}
      <div class="answer-form">
        <div class="input-container">
          <input
            class="answer-input"
            type="text"
            value={input()}
            onInput={(event) => {
              const filtered = (event.target as HTMLInputElement).value.replace(/\D/g, '')
              setInput(filtered)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleNumericSubmit()
              }
            }}
            placeholder="Enter position number"
            aria-label="Enter position number"
            inputmode="none"
            autocomplete="off"
          />
        </div>

        <div class="feedback-area">
          {feedback() && (
            <div
              class="feedback-message"
              classList={{
                'feedback-correct': isCorrect(),
                'feedback-error': !isCorrect()
              }}
            >
              {feedback()}
            </div>
          )}
        </div>

        <NumericKeyboard
          isVisible={true}
          onDigit={handleNumericDigit}
          onDelete={handleNumericDelete}
          onSubmit={handleNumericSubmit}
        />
      </div>
    </div>
  )
} 