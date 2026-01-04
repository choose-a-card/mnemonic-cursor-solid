import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'

export default function ClassicQuiz() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')

  function nextQuestion(): void {
    setFeedback('')
    setInput('')

    // Pick a random card from the practice stack
    const practiceIdx = getRandomInt(practiceStack().length)
    const card = practiceStack()[practiceIdx]

    // Calculate the actual position in the full stack
    const actualPos = cardInterval().start + practiceIdx

    setQuestion({ card, answer: actualPos, type: 'card-to-pos' })
  }

  function handleSubmit(e: Event): void {
    e.preventDefault()
    
    // Remove focus on touch devices to prevent stuck hover state
    if ('ontouchstart' in window) {
      const target = e.target as HTMLFormElement
      const submitBtn = target.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitBtn) submitBtn.blur()
    }
    
    const q = question()
    const correct = Number(input()) === q.answer

    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')

    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${q.answer}`)
    }

    onResult({
      correct,
      question: q,
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

      {/* Answer Form */}
      <form class="answer-form" onSubmit={handleSubmit}>
        <div class="input-container">
          <input
            class="answer-input"
            type="number"
            value={input()}
            onInput={e => setInput((e.target as HTMLInputElement).value)}
            placeholder="Enter position number"
            required
            autofocus
          />
        </div>

        <div class="feedback-area">
          {feedback() && (
            <div class="feedback-message">{feedback()}</div>
          )}
        </div>

        <button class="submit-btn" type="submit">
          Submit Answer
        </button>
      </form>
    </div>
  )
} 