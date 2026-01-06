import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'
import { calculateCutAnswer } from './cuttingEstimationUtils'

export default function CuttingEstimation() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)

  function nextQuestion(): void {
    setFeedback('')
    setInput('')
    setIsCorrect(false)
    
    const N = practiceStack().length
    
    // Randomly select a bottom card (cut position)
    const cutIdx = getRandomInt(N)
    const cutCard = practiceStack()[cutIdx]
    
    // When a card is at the bottom (cutIdx), the top card is at (cutIdx + 1) % N
    // To bring a target card to the top, we need to calculate how many cards to cut
    
    // Randomly select an offset between -8 and +8, excluding 0
    // This offset represents how many positions away from the current top the target should be
    let offset = 0
    while (offset === 0) {
      offset = getRandomInt(17) - 8 // -8 to +8
    }
    
    // Calculate target position: if bottom is at cutIdx, top is at (cutIdx + 1) % N
    // Target should be offset positions from the top: targetIdx = (cutIdx + 1 + offset + N) % N
    const targetIdx = (cutIdx + 1 + offset + N) % N
    const targetCard = practiceStack()[targetIdx]
    
    // Calculate the correct answer using the utility function
    // This ensures consistency and allows for proper testing
    // We calculate from actual card positions rather than using offset directly
    // to ensure correctness even if there are any edge cases
    const answer = calculateCutAnswer(practiceStack(), cutCard, targetCard)
    
    // Verify that the answer matches the offset we used to generate the question
    // (after normalization). This is a sanity check - they should always match.
    if (answer !== offset) {
      console.error(`Answer mismatch: calculated ${answer}, expected ${offset}. This should not happen!`)
      // Use the calculated answer (from actual positions) as it's more reliable
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
    setIsCorrect(correct)
    
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

        <button class="submit-btn" type="submit">
          Submit Answer
        </button>
      </form>
    </div>
  )
} 