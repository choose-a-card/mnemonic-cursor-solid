import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'

export default function FirstOrSecondHalf() {
  const { practiceStack, cardInterval, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [feedback, setFeedback] = createSignal<string>('')
  const [answered, setAnswered] = createSignal<boolean>(false)

  function nextQuestion(): void {
    setFeedback('')
    setAnswered(false)
    // Pick a random card from the practice stack
    const practiceIdx = getRandomInt(practiceStack().length)
    const card = practiceStack()[practiceIdx]
    // Calculate the actual position in the full stack
    const actualPos = cardInterval().start + practiceIdx
    const answer = actualPos <= 26 ? 'First Half' : 'Second Half'
    setQuestion({ card, pos: actualPos, answer, type: 'first-or-second-half' })
  }

  function handleAnswer(userInput: string, event?: MouseEvent): void {
    if (answered()) return
    
    // Remove focus on touch devices to prevent stuck hover state
    if (event && 'ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    
    const q = question()
    const correct = (String(q.answer).toLowerCase().replace(/\s+/g, '') === userInput.toLowerCase().replace(/\s+/g, '')) ||
      (q.answer === 'First Half' && ['first', 'first half', '1', 'one'].includes(userInput.toLowerCase().replace(/\s+/g, '')))
      || (q.answer === 'Second Half' && ['second', 'second half', '2', 'two'].includes(userInput.toLowerCase().replace(/\s+/g, '')))
    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setFeedback(correct ? 'Correct! ✅' : `Wrong. Answer: ${q.answer}`)
    setAnswered(true)
    onResult({ 
      correct, 
      question: q, 
      input: userInput, 
      mode: 'First or Second Half' 
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
        <div class="quiz-question-text">Is this card in the first or second half of the deck?</div>
      </div>
        <div class={`quiz-card-large ${((question().card || '').includes('♥') || (question().card || '').includes('♦')) ? 'card-red' : 'card-black'}`}>{question().card}</div>
      {/* Answer Buttons */}
      <div class="answer-buttons">
        <button class="answer-btn" onClick={(e) => handleAnswer('First Half', e)} disabled={answered()}>First Half</button>
        <button class="answer-btn" onClick={(e) => handleAnswer('Second Half', e)} disabled={answered()}>Second Half</button>
      </div>
      <div class="feedback-area">
        {feedback() && (
          <div class="feedback-message">{feedback()}</div>
        )}
      </div>
    </div>
  )
} 