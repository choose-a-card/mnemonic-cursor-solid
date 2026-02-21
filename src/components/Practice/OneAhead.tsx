import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import CardKeyboard from '../shared/CardKeyboard'
import CardText from '../shared/CardText'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { usePractice } from '../../contexts/PracticeContext'

export default function OneAhead() {
  const { practiceStack, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string | null>(null)
  const [feedbackCard, setFeedbackCard] = createSignal<string | null>(null)
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)
    
  function nextQuestion(): void {
    setFeedback(null)
    setFeedbackCard(null)
    setIsCorrect(false)
    setInput('')
    setShowKeyboard(true) // Keep keyboard open for next question
    setShowKeyboard(true) // Keep keyboard open for next question
    
    // Pick a random card from the practice stack
    const practiceIdx = getRandomInt(practiceStack().length)
    const card = practiceStack()[practiceIdx]
    
    // Calculate the next card position in the practice range
    const nextPracticeIdx = (practiceIdx + 1) % practiceStack().length
    const nextCard = practiceStack()[nextPracticeIdx]
    
    setQuestion({ card, answer: nextCard, type: 'one-ahead' })
  }

  function handleCardSelect(card: string): void {
    setInput(card)
    const q = question()
    
    const correct = card.toUpperCase().replace(/\s+/g,'') === String(q.answer).replace(/\s+/g,'').toUpperCase()
    
    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)
    
    if (correct) {
      setFeedback('Correct! ✅')
      setFeedbackCard(null)
    } else {
      setFeedback('Wrong. Answer: ')
      setFeedbackCard(String(q.answer))
    }
    
    onResult({ 
      correct, 
      question: q, 
      input: card, 
      mode: 'One Ahead' 
    })
    
    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  function handlePartialSelect(partial: string): void {
    setInput(partial)
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      {/* Question */}
      <div class="question-card">
        <div class="question-text">What card comes after <CardText card={question().card || ''} />?</div>
      </div>
      
      {/* Answer Form */}
      <div class="answer-form">
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
    </div>
  )
} 