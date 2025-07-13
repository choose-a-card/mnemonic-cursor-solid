import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion, QuizResult } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'

interface CuttingEstimationProps {
  stack: string[];
  numCards: number;
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
}

export default function CuttingEstimation(props: CuttingEstimationProps) {
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')

  function nextQuestion(): void {
    setFeedback('')
    setInput('')
    
    // Cut card is always the bottom card (position 1, index 0)
    const cutIdx = 0
    const cutCard = props.stack[cutIdx]
    
    // Target can be anywhere in the stack
    const targetIdx = getRandomInt(props.numCards)
    const targetCard = props.stack[targetIdx]
    
    // Calculate distance: positive if target is after cut, negative if before
    // For cutting estimation, we want: how many cards to cut from bottom to reach target
    let distance: number
    if (targetIdx === cutIdx) {
      distance = 0 // Target is the bottom card
    } else if (targetIdx > cutIdx) {
      distance = targetIdx - cutIdx // Target is after bottom card
    } else {
      // Target is before bottom card (wrapped around)
      distance = -(props.numCards - targetIdx) // Negative distance
    }
    
    setQuestion({ 
      targetCard, 
      cutCard, 
      answer: distance, 
      type: 'cutting',
      targetPos: targetIdx + 1,
      cutPos: cutIdx + 1
    })
  }

  function handleSubmit(e: Event): void {
    e.preventDefault()
    const q = question()
    
    const correct = Number(input()) === q.answer
    
    playSound(props.soundEnabled, correct ? 'correct' : 'incorrect')
    
    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${q.answer} cards`)
    }
    
    props.onResult({ 
      correct, 
      question: q, 
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
          Target: {question().targetCard}. You cut to {question().cutCard}. How many more cards to cut?
        </div>
      </div>
      
      {/* Answer Form */}
      <form class="answer-form" onSubmit={handleSubmit}>
        <div class="input-container">
          <input
            class="answer-input"
            type="number"
            value={input()}
            onInput={e => setInput((e.target as HTMLInputElement).value)}
            placeholder="Enter number"
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