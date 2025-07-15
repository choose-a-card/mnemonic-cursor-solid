import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion, QuizResult, CardInterval } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import CardKeyboard from '../shared/CardKeyboard'
import { SUITS, RANKS } from '../../constants/cards'
import { calculateCutCard } from './cutToPositionUtils'

interface CutToPositionProps {
  stack: string[];
  practiceStack: string[];
  cardInterval: CardInterval;
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
}

export default function CutToPosition(props: CutToPositionProps) {
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [answered, setAnswered] = createSignal<boolean>(false)
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)

  function nextQuestion(): void {
    setFeedback('')
    setAnswered(false)
    setInput('')
    // Pick a random target card and position
    const N = props.stack.length
    const targetIdx = getRandomInt(N)
    const targetCard = props.stack[targetIdx]
    const targetPos = getRandomInt(N) + 1 // 1-based
    // Calculate the cut card
    const cutCard = calculateCutCard(props.stack, targetCard, targetPos)
    setQuestion({
      answer: cutCard,
      type: 'cut-to-position',
      card: targetCard,
      pos: targetPos
    })
  }

  function handleSubmit() {
    if (answered()) return
    const q = question()
    const correct = input().replace(/\s+/g, '').toUpperCase() === String(q.answer).replace(/\s+/g, '').toUpperCase()
    playSound(props.soundEnabled, correct ? 'correct' : 'incorrect')
    setFeedback(correct ? 'Correct! ✅' : `Wrong. Answer: ${q.answer}`)
    setAnswered(true)
    props.onResult({
      correct,
      question: q,
      input: input(),
      mode: 'Cut to Position'
    })
    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      <div class="question-card">
        <div class="question-text">
          Which card should be on the bottom to make <b>{question().card}</b> appear at position <b>{question().pos}</b>?
        </div>
      </div>
      <div class="cut-card-input-area">
        <input
          class="cut-card-input"
          type="text"
          value={input()}
          placeholder="Select cut card"
          readonly
          onClick={() => setShowKeyboard(true)}
        />
        <CardKeyboard
          isVisible={showKeyboard()}
          onClose={() => setShowKeyboard(false)}
          onCardSelect={card => {
            setInput(card)
            setShowKeyboard(false)
          }}
        />
      </div>
      <div class="feedback-area">
        {feedback() && (
          <div class="feedback-message">{feedback()}</div>
        )}
      </div>
      <button class="submit-btn" type="button" onClick={handleSubmit} disabled={answered()}>
        Submit
      </button>
    </div>
  )
} 