import { createEffect, createSignal, onMount } from 'solid-js'
import type { QuizQuestion, QuizResult, CardInterval } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import CardKeyboard from '../shared/CardKeyboard'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'

interface OneAheadProps {
  stack: string[];
  practiceStack: string[];
  cardInterval: CardInterval;
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
}

export default function OneAhead(props: OneAheadProps) {
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)
  createEffect(() => {
    console.log('OneAhead: showKeyboard changed to:', showKeyboard())
  })
  function nextQuestion(): void {
    setFeedback('')
    setInput('')
    setShowKeyboard(false)
    
    // Pick a random card from the practice stack
    const practiceIdx = getRandomInt(props.practiceStack.length)
    const card = props.practiceStack[practiceIdx]
    
    // Calculate the next card position in the practice range
    const nextPracticeIdx = (practiceIdx + 1) % props.practiceStack.length
    const nextCard = props.practiceStack[nextPracticeIdx]
    
    setQuestion({ card, answer: nextCard, type: 'one-ahead' })
  }

  function handleSubmit(e: Event): void {
    e.preventDefault()
    const q = question()
    
    const correct = input().toUpperCase().replace(/\s+/g,'') === String(q.answer).replace(/\s+/g,'').toUpperCase()
    
    playSound(props.soundEnabled, correct ? 'correct' : 'incorrect')
    
    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${q.answer}`)
    }
    
    props.onResult({ 
      correct, 
      question: q, 
      input: input(), 
      mode: 'One Ahead' 
    })
    
            setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  function handleCardSelect(card: string): void {
    setInput(card)
    setShowKeyboard(false)
    setTimeout(() => {
      const event = new Event('submit')
      handleSubmit(event)
    }, 100)
  }

  onMount(() => {
    nextQuestion()
  })

  createEffect(() => {
    console.log('OneAhead: showKeyboard changed to:', showKeyboard())
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="question-text">What card comes after {question().card}?</div>
      </div>
      
      {/* Answer Form */}
      <form class="answer-form" onSubmit={handleSubmit}>
        <div class="input-container">
          <input
            class="answer-input"
            type="text"
            value={input()}
            onInput={e => setInput((e.target as HTMLInputElement).value)}
            onFocus={() => setShowKeyboard(true)}
            placeholder="Enter card"
            required
            autofocus
            readonly={true}
          />

          <CardKeyboard
            isVisible={showKeyboard()}
            onClose={() => setShowKeyboard(false)}
            onCardSelect={handleCardSelect}
          />
        </div>

        <div class="feedback-area">
          {feedback() && (
            <div class="feedback-message">{feedback()}</div>
          )}
        </div>
      </form>
    </div>
  )
} 