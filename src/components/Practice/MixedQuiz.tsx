import { createSignal, onMount, Show } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds'
import { getRandomInt } from '../../utils/utils'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'
import CardKeyboard from '../shared/CardKeyboard'
import NumericKeyboard from '../shared/NumericKeyboard'

type QuestionType = 'card-to-pos' | 'pos-to-card'

export default function MixedQuiz() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [questionType, setQuestionType] = createSignal<QuestionType>('card-to-pos')
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [feedbackCard, setFeedbackCard] = createSignal<string | null>(null)
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const nextQuestion = (): void => {
    setFeedback('')
    setFeedbackCard(null)
    setInput('')
    setIsCorrect(false)

    // Pick a random card/position from the practice stack
    const practiceIdx = getRandomInt(practiceStack().length)
    const card = practiceStack()[practiceIdx]
    const actualPos = cardInterval().start + practiceIdx

    // Randomly pick question type (50/50)
    const type: QuestionType = Math.random() < 0.5 ? 'card-to-pos' : 'pos-to-card'
    setQuestionType(type)

    if (type === 'card-to-pos') {
      setQuestion({ card, answer: actualPos, type: 'card-to-pos' })
    } else {
      setQuestion({ pos: actualPos, answer: card, type: 'pos-to-card' })
    }
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
    setFeedbackCard(null)

    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${currentQuestion.answer}`)
    }

    onResult({
      correct,
      question: currentQuestion,
      input: input(),
      mode: 'Mixed'
    })

    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  const handleSubmitPosToCard = (): void => {
    const currentQuestion = question()
    const userAnswer = input().toUpperCase().replace(/\s+/g, '')
    const correctAnswer = String(currentQuestion.answer).replace(/\s+/g, '').toUpperCase()
    const correct = userAnswer === correctAnswer

    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)

    if (correct) {
      setFeedback('Correct! ✅')
      setFeedbackCard(null)
    } else {
      setFeedback('Wrong. Answer: ')
      setFeedbackCard(String(currentQuestion.answer))
    }

    onResult({
      correct,
      question: currentQuestion,
      input: input(),
      mode: 'Mixed'
    })

    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  const handleCardSelect = (card: string): void => {
    setInput(card)
    setTimeout(() => {
      handleSubmitPosToCard()
    }, 100)
  }

  const handlePartialSelect = (partial: string): void => {
    setInput(partial)
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <Show when={questionType() === 'card-to-pos'}>
          <div class="question-text">What position is <CardText card={question().card || ''} />?</div>
        </Show>
        <Show when={questionType() === 'pos-to-card'}>
          <div class="question-text">What card is at position {question().pos}?</div>
        </Show>
      </div>

      {/* Card → Position: custom numeric keyboard */}
      <Show when={questionType() === 'card-to-pos'}>
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
      </Show>

      {/* Position → Card: card keyboard */}
      <Show when={questionType() === 'pos-to-card'}>
        <div class="answer-form">
          <div class="input-container">
            <input
              class="answer-input"
              type="text"
              value={input()}
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
            {feedback() && (
              <div
                class="feedback-message"
                classList={{
                  'feedback-correct': isCorrect(),
                  'feedback-error': !isCorrect()
                }}
              >
                {feedback()}
                {feedbackCard() && <CardText card={feedbackCard()!} />}
              </div>
            )}
          </div>
        </div>
      </Show>
    </div>
  )
}
