import { createSignal, onMount, onCleanup, Show } from 'solid-js'
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
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const [isDragging, setIsDragging] = createSignal<boolean>(false)
  const [dragX, setDragX] = createSignal<number>(0)
  const [dragStartX, setDragStartX] = createSignal<number>(0)
  let cardRef: HTMLDivElement | undefined

  function nextQuestion(): void {
    setFeedback('')
    setAnswered(false)
    setIsCorrect(false)
    setIsDragging(false)
    setDragX(0)
    setDragStartX(0)
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
    
    submitAnswer(userInput)
  }

  function submitAnswer(userInput: string): void {
    if (answered()) return
    
    const q = question()
    const correct = (String(q.answer).toLowerCase().replace(/\s+/g, '') === userInput.toLowerCase().replace(/\s+/g, '')) ||
      (q.answer === 'First Half' && ['first', 'first half', '1', 'one'].includes(userInput.toLowerCase().replace(/\s+/g, '')))
      || (q.answer === 'Second Half' && ['second', 'second half', '2', 'two'].includes(userInput.toLowerCase().replace(/\s+/g, '')))
    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setFeedback(correct ? 'Correct! ✅' : `Wrong. Answer: ${q.answer}`)
    setIsCorrect(correct)
    setAnswered(true)
    setIsDragging(false)
    setDragX(0)
    onResult({ 
      correct, 
      question: q, 
      input: userInput, 
      mode: 'First or Second Half' 
    })
    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  const DRAG_THRESHOLD = 100 // Minimum distance to trigger answer
  const MAX_DRAG_DISTANCE = 200 // Maximum drag distance for visual feedback

  const handleDragStart = (clientX: number): void => {
    if (answered()) return
    setIsDragging(true)
    setDragStartX(clientX)
    setDragX(0)
  }

  const handleDragMove = (clientX: number): void => {
    if (!isDragging() || answered()) return
    
    const deltaX = clientX - dragStartX()
    setDragX(deltaX)
  }

  const handleDragEnd = (): void => {
    if (!isDragging() || answered()) return
    
    const currentDragX = dragX()
    const absDragX = Math.abs(currentDragX)
    
    if (absDragX >= DRAG_THRESHOLD) {
      // Determine answer based on drag direction
      const answer = currentDragX > 0 ? 'Second Half' : 'First Half'
      submitAnswer(answer)
    } else {
      // Reset card position if threshold not reached
      setIsDragging(false)
      setDragX(0)
    }
  }

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent): void => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging()) return
    e.preventDefault()
    handleDragMove(e.clientX)
  }

  const handleMouseUp = (): void => {
    handleDragEnd()
  }

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      e.preventDefault()
      handleDragStart(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: TouchEvent): void => {
    if (!isDragging() || e.touches.length === 0) return
    e.preventDefault()
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = (): void => {
    handleDragEnd()
  }

  // Add global event listeners for mouse move/up and initialize
  onMount(() => {
    nextQuestion()
    
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
    const handleGlobalMouseUp = () => handleMouseUp()
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    onCleanup(() => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    })
  })

  // Calculate card transform styles
  const getCardStyle = () => {
    const currentDragX = dragX()
    const absDragX = Math.abs(currentDragX)
    const clampedDragX = Math.max(-MAX_DRAG_DISTANCE, Math.min(MAX_DRAG_DISTANCE, currentDragX))
    
    // Calculate rotation (max 30 degrees)
    const rotation = (clampedDragX / MAX_DRAG_DISTANCE) * 30
    
    // Calculate opacity (fade out as drag increases)
    const opacity = Math.max(0.3, 1 - (absDragX / MAX_DRAG_DISTANCE) * 0.5)
    
    return {
      transform: `translateX(${clampedDragX}px) rotate(${rotation}deg)`,
      opacity: isDragging() ? opacity : 1,
      transition: isDragging() ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
      cursor: answered() ? 'default' : 'grab',
    }
  }

  // Determine which answer label to show
  const getDragDirection = () => {
    const currentDragX = dragX()
    if (Math.abs(currentDragX) < DRAG_THRESHOLD) return null
    return currentDragX > 0 ? 'second' : 'first'
  }

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="quiz-question-text">Is this card in the first or second half of the deck?</div>
      </div>
      
      {/* Card Container with drag functionality */}
      <div class="swipeable-card-container">
        {/* Answer labels that appear during drag */}
        <Show when={isDragging() && getDragDirection() === 'first'}>
          <div class="swipe-label swipe-label-left">First Half</div>
        </Show>
        <Show when={isDragging() && getDragDirection() === 'second'}>
          <div class="swipe-label swipe-label-right">Second Half</div>
        </Show>
        
        <div 
          ref={cardRef}
          class="quiz-card-large swipeable-card"
          classList={{ 
            'dragging': isDragging(),
            'card-red': (question().card || '').includes('♥') || (question().card || '').includes('♦'),
            'card-black': !((question().card || '').includes('♥') || (question().card || '').includes('♦'))
          }}
          style={getCardStyle()}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {question().card}
        </div>
      </div>
      
      {/* Answer Buttons */}
      <div class="answer-buttons">
        <button class="answer-btn" onClick={(e) => handleAnswer('First Half', e)} disabled={answered()}>First Half</button>
        <button class="answer-btn" onClick={(e) => handleAnswer('Second Half', e)} disabled={answered()}>Second Half</button>
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
    </div>
  )
} 