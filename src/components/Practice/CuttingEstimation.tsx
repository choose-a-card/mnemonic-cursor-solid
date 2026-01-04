import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'

export default function CuttingEstimation() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')

  function nextQuestion(): void {
    setFeedback('')
    setInput('')
    
    // Randomly select a cut position (simulating a cut)
    const N = practiceStack().length
    const cutIdx = getRandomInt(N)
    const cutCard = practiceStack()[cutIdx]
    
    // Randomly select an offset between -8 and +8, excluding 0
    let offset = 0
    while (offset === 0) {
      offset = getRandomInt(17) - 8 // -8 to +8
    }
    // Compute target position, wrapping around
    const targetIdx = (cutIdx + offset + N) % N
    const targetCard = practiceStack()[targetIdx]
    
    setQuestion({ 
      targetCard, 
      cutCard, 
      answer: offset, 
      type: 'cutting',
      targetPos: cardInterval().start + targetIdx,
      cutPos: cardInterval().start + cutIdx
    })
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
      setFeedback(`Wrong. Answer: ${q.answer} cards`)
    }
    
    onResult({ 
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
          <div><b>Bottom card:</b> <CardText card={question().cutCard || ''} /></div>
          <div><b>Target card:</b> <CardText card={question().targetCard || ''} /></div>
          <div style={{'margin-top': '1rem'}}>How many cards (±8) to cut to bring the target to the top? <br/>(+ = forward, – = backward)</div>
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