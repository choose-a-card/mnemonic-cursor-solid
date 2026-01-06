import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import CardKeyboard from '../shared/CardKeyboard'
import CardText from '../shared/CardText'
import { usePractice } from '../../contexts/PracticeContext'
import { calculateCutCard } from './cutToPositionUtils'

export default function CutToPosition() {
  const { stack, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string | null>(null)
  const [feedbackCard, setFeedbackCard] = createSignal<string | null>(null)
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const [answered, setAnswered] = createSignal<boolean>(false)
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)

  function nextQuestion(): void {
    setFeedback(null)
    setFeedbackCard(null)
    setIsCorrect(false)
    setAnswered(false)
    setInput('')
    setShowKeyboard(true) // Keep keyboard open for next question
    // Pick a random target card and position
    const N = stack().length
    const targetIdx = getRandomInt(N)
    const targetCard = stack()[targetIdx]
    const targetPos = getRandomInt(N) + 1 // 1-based
    // Calculate the cut card
    const cutCard = calculateCutCard(stack(), targetCard, targetPos)
    setQuestion({
      answer: cutCard,
      type: 'cut-to-position',
      card: targetCard,
      pos: targetPos
    })
  }

  function handleCardSelect(card: string): void {
    if (answered()) return
    
    setInput(card)
    const q = question()
    const correct = card.replace(/\s+/g, '').toUpperCase() === String(q.answer).replace(/\s+/g, '').toUpperCase()
    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)
    if (correct) {
      setFeedback('Correct! ✅')
      setFeedbackCard(null)
    } else {
      setFeedback('Wrong. Answer: ')
      setFeedbackCard(String(q.answer))
    }
    setAnswered(true)
    onResult({
      correct,
      question: q,
      input: card,
      mode: 'Cut to Position'
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
      <div class="question-card">
        <div class="question-text">
          Which card should be on the bottom to make <b><CardText card={question().card || ''} /></b> appear at position <b>{question().pos}</b>?
        </div>
      </div>
      <div class="cut-card-input-area">
        <input
          class="cut-card-input"
          type="text"
          value={input()}
          placeholder="Select cut card"
          readonly
          onFocus={() => setShowKeyboard(true)}
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
  )
} 