import { createSignal, onMount, createEffect } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds';
import { getRandomInt } from '../../utils/utils';
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { RANKS, SUITS } from '../../constants/cards'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'

export default function QuartetPosition() {
  const { stack, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [inputs, setInputs] = createSignal<string[]>(['', '', '', ''])
  const [feedback, setFeedback] = createSignal<string>('')
  const [answered, setAnswered] = createSignal<boolean>(false)
  const [wrongIndexes, setWrongIndexes] = createSignal<number[]>([])
  let inputRefs: HTMLInputElement[] = []

  function nextQuestion(): void {
    setFeedback('')
    setAnswered(false)
    setInputs(['', '', '', ''])
    setWrongIndexes([])
    // Pick a random rank
    const rankIdx = getRandomInt(RANKS.length)
    const rank = RANKS[rankIdx]
    // Find all cards of that rank in the stack
    const quartetCards = SUITS.map(suit => rank + suit.symbol)
    const positions = stack().reduce((acc, current, index) => {
        if(quartetCards.includes(current)) {
            acc.push(index + 1)
        }
        return acc
    }, [] as number[])
    setQuestion({
      answer: positions.join(','),
      type: 'quartet-position',
      card: rank
    })
  }

  function handleInput(idx: number, value: string) {
    const newInputs = [...inputs()]
    newInputs[idx] = value.replace(/[^0-9]/g, '')
    setInputs(newInputs)
  }

  function handleKeyDown(e: KeyboardEvent, idx: number) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (idx < 3) {
        inputRefs[idx + 1]?.focus()
      } else {
        handleSubmit()
      }
    }
  }

  function handleSubmit(event?: Event) {
    if (answered()) return
    
    // Remove focus on touch devices to prevent stuck hover state
    if (event && 'ontouchstart' in window) {
      const target = event.target as HTMLFormElement
      const submitBtn = target.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitBtn) submitBtn.blur()
    }
    
    const userPositions = inputs().map(v => Number(v)).filter(Boolean)
    const correctPositions = String(question().answer).split(',').map((pos: string) => Number(pos))
    // Sort both arrays to compare sets (order doesn't matter)
    const sortedUserPositions = [...userPositions].sort((a, b) => a - b)
    const sortedCorrectPositions = [...correctPositions].sort((a, b) => a - b)
    // Check if all 4 positions match (order independent)
    const correct =
      userPositions.length === 4 &&
      sortedUserPositions.every((pos, i) => pos === sortedCorrectPositions[i])
    let wrongs: number[] = []
    if (!correct) {
      // Mark wrong inputs - check if each input value is in the correct positions set
      wrongs = inputs().map((v, i) => {
        const numValue = Number(v)
        return numValue && !correctPositions.includes(numValue) ? i : -1
      }).filter(i => i !== -1)
      setWrongIndexes(wrongs)
    } else {
      setWrongIndexes([])
    }
    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setFeedback(correct ? 'Correct! ✅' : `Wrong. Positions: ${correctPositions.join(', ')}`)
    setAnswered(true)
    onResult({
      correct,
      question: question(),
      input: inputs().join(','),
      mode: 'Quartet Position'
    })
    setTimeout(() => {
      nextQuestion()
      // Focus first input after next question
      setTimeout(() => inputRefs[0]?.focus(), 0)
    }, FEEDBACK_TIMER_MS)
    if (!correct && wrongs.length > 0) {
      setTimeout(() => inputRefs[wrongs[0]]?.focus(), 0)
    }
  }

  onMount(() => {
    nextQuestion()
  })

  createEffect(() => {
    // On next question, always focus first input
    if (!answered()) {
      setTimeout(() => inputRefs[0]?.focus(), 0)
    }
  })

  return (
    <div class="practice-mode">
      <div class="question-card">
        <div class="question-text">
          Enter the positions of all the <b><CardText card={question().card || ''} />s</b> in the stack:
        </div>
      </div>
      <form class="quartet-form" onSubmit={e => { e.preventDefault(); handleSubmit(e); }}>
        <div class="quartet-inputs">
          {[0,1,2,3].map(i => (
            <input
              class={`quartet-input${wrongIndexes().includes(i) ? ' quartet-input-wrong' : ''}`}
              type="number"
              min="1"
              max="52"
              value={inputs()[i]}
              onInput={e => handleInput(i, (e.target as HTMLInputElement).value)}
              onKeyDown={e => handleKeyDown(e as KeyboardEvent, i)}
              ref={el => inputRefs[i] = el as HTMLInputElement}
              required
              autofocus={i === 0}
            />
          ))}
        </div>
        <div class="feedback-area">
          {feedback() && (
            <div class="feedback-message">{feedback()}</div>
          )}
        </div>
        <button class="submit-btn" type="submit" disabled={answered()}>
          Submit
        </button>
      </form>
    </div>
  )
} 