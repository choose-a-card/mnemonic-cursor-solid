import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds'
import { getRandomInt } from '../../utils/utils'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'
import { calculateCutAnswer } from './cuttingEstimationUtils'
import NumericKeyboard from '../shared/NumericKeyboard'

export default function CuttingEstimation() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)

  const nextQuestion = (): void => {
    setFeedback('')
    setInput('')
    setIsCorrect(false)

    const N = practiceStack().length

    const cutIdx = getRandomInt(N)
    const cutCard = practiceStack()[cutIdx]

    let offset = 0
    while (offset === 0) {
      offset = getRandomInt(17) - 8
    }

    const targetIdx = (cutIdx + 1 + offset + N) % N
    const targetCard = practiceStack()[targetIdx]

    const answer = calculateCutAnswer(practiceStack(), cutCard, targetCard)

    if (answer !== offset) {
      console.error(`Answer mismatch: calculated ${answer}, expected ${offset}. This should not happen!`)
    }

    setQuestion({
      targetCard,
      cutCard,
      answer: answer,
      type: 'cutting',
      targetPos: cardInterval().start + targetIdx,
      cutPos: cardInterval().start + cutIdx
    })
  }

  const handleNumericDigit = (digit: string): void => {
    // Only allow digits (sign is handled by toggle)
    setInput(previous => {
      const isNegative = previous.startsWith('-')
      const digits = previous.replace('-', '')
      const newDigits = digits + digit
      return isNegative ? '-' + newDigits : newDigits
    })
  }

  const handleNumericDelete = (): void => {
    setInput(previous => {
      const isNegative = previous.startsWith('-')
      const digits = previous.replace('-', '')
      const newDigits = digits.slice(0, -1)
      // If no digits left, remove the sign too
      if (newDigits === '') return ''
      return isNegative ? '-' + newDigits : newDigits
    })
  }

  const handleToggleSign = (): void => {
    setInput(previous => {
      if (previous === '' || previous === '-') return previous === '-' ? '' : '-'
      return previous.startsWith('-') ? previous.slice(1) : '-' + previous
    })
  }

  const handleNumericSubmit = (): void => {
    const currentQuestion = question()
    const correct = Number(input()) === currentQuestion.answer

    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)

    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${currentQuestion.answer} cards`)
    }

    onResult({
      correct,
      question: currentQuestion,
      input: input(),
      mode: 'Cutting Estimation'
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
        <div class="question-text">
          <div>
            <b>Bottom:</b> <CardText card={question().cutCard || ''} /> &nbsp;·&nbsp; <b>Target:</b> <CardText card={question().targetCard || ''} />
          </div>
          <div style={{'margin-top': '0.5rem', 'font-size': '0.95em'}}>
            Cut to bring <CardText card={question().targetCard || ''} /> to top?
          </div>
        </div>
      </div>

      {/* Answer */}
      <div class="answer-form">
        <div class="input-container">
          <input
            class="answer-input"
            type="text"
            value={input()}
            onInput={(event) => {
              const raw = (event.target as HTMLInputElement).value
              const filtered = raw.replace(/[^0-9-]/g, '')
              // Allow at most one leading minus
              const cleaned = filtered.replace(/(?!^)-/g, '')
              setInput(cleaned)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleNumericSubmit()
              }
            }}
            placeholder="Enter number (± for sign)"
            aria-label="Enter number"
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
          onToggleSign={handleToggleSign}
        />
      </div>
    </div>
  )
} 