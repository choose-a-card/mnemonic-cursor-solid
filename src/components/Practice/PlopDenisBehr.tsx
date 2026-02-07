import { createSignal, onMount, Show, For } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds'
import { getRandomInt } from '../../utils/utils'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { RANKS, SUITS } from '../../constants/cards'
import { PLOP_DATA } from '../../constants/plopData'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'

const TRIPLE_CLICK_THRESHOLD_MS = 600

const SUIT_SYMBOLS = SUITS.map(s => s.symbol)

export default function PlopDenisBehr() {
  const { soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [showCheatSheet, setShowCheatSheet] = createSignal<boolean>(false)
  let clickTimestamps: number[] = []
  const [selectedSuit, setSelectedSuit] = createSignal<string>('')
  const [inputs, setInputs] = createSignal<string[]>(['', '', ''])
  const [feedback, setFeedback] = createSignal<string>('')
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const [answered, setAnswered] = createSignal<boolean>(false)
  const [wrongSuit, setWrongSuit] = createSignal<boolean>(false)
  const [wrongIndexes, setWrongIndexes] = createSignal<number[]>([])
  let inputRefs: HTMLInputElement[] = []

  const nextQuestion = (): void => {
    setFeedback('')
    setIsCorrect(false)
    setAnswered(false)
    setSelectedSuit('')
    setInputs(['', '', ''])
    setWrongSuit(false)
    setWrongIndexes([])

    const rankIdx = getRandomInt(RANKS.length)
    const rank = RANKS[rankIdx]
    const plopEntry = PLOP_DATA[rank]

    setQuestion({
      answer: `${plopEntry.cutSuit},${plopEntry.distances.join(',')}`,
      type: 'plop-denis-behr',
      card: rank
    })
  }

  const handleSuitSelect = (suit: string): void => {
    if (answered()) return
    setSelectedSuit(suit)
    // Auto-focus the first distance input after selecting a suit
    setTimeout(() => inputRefs[0]?.focus(), 0)
  }

  const handleInput = (idx: number, value: string): void => {
    const newInputs = [...inputs()]
    newInputs[idx] = value.replace(/[^0-9]/g, '')
    setInputs(newInputs)
  }

  const handleKeyDown = (event: KeyboardEvent, idx: number): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (idx < 2) {
        inputRefs[idx + 1]?.focus()
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = (event?: Event): void => {
    if (answered()) return

    // Remove focus on touch devices to prevent stuck hover state
    if (event && 'ontouchstart' in window) {
      const target = event.target as HTMLFormElement
      const submitBtn = target.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitBtn) submitBtn.blur()
    }

    const rank = question().card || ''
    const plopEntry = PLOP_DATA[rank]
    if (!plopEntry) return

    const userSuit = selectedSuit()
    const userDistances = inputs().map(v => Number(v))
    const correctSuit = plopEntry.cutSuit
    const correctDistances = plopEntry.distances

    const suitCorrect = userSuit === correctSuit
    const distanceResults = userDistances.map((val, idx) => val === correctDistances[idx])
    const allDistancesCorrect = distanceResults.every(Boolean)
    const correct = suitCorrect && allDistancesCorrect

    // Track wrong fields
    setWrongSuit(!suitCorrect)
    const wrongs = distanceResults.map((isOk, idx) => isOk ? -1 : idx).filter(i => i !== -1)
    setWrongIndexes(wrongs)

    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)
    setFeedback(
      correct
        ? 'Correct! ✅'
        : `Wrong. Answer: ${plopEntry.cutCard} (${correctDistances.join(', ')})`
    )
    setAnswered(true)

    onResult({
      correct,
      question: question(),
      input: `${userSuit},${inputs().join(',')}`,
      mode: 'PLOP - Denis Behr'
    })

    setTimeout(() => {
      nextQuestion()
      setTimeout(() => inputRefs[0]?.focus(), 0)
    }, FEEDBACK_TIMER_MS)

    if (!correct && wrongs.length > 0) {
      setTimeout(() => inputRefs[wrongs[0]]?.focus(), 0)
    }
  }

  onMount(() => {
    nextQuestion()
  })

  const handleQuestionClick = (): void => {
    const now = Date.now()
    clickTimestamps = [...clickTimestamps, now].filter(
      timestamp => now - timestamp < TRIPLE_CLICK_THRESHOLD_MS
    )
    if (clickTimestamps.length >= 3) {
      setShowCheatSheet(prev => !prev)
      clickTimestamps = []
    }
  }

  return (
    <div class="practice-mode">
      <div class="question-card" onClick={handleQuestionClick}>
        <div class="question-text">
          For all the <b><CardText card={question().card || ''} />s</b>, enter the cut card and the relative distances:
        </div>
      </div>

      {/* Cheat sheet panel */}
      <Show when={showCheatSheet()}>
        <div class="plop-cheatsheet">
          <div class="plop-cheatsheet-title">PLOP Cheat Sheet</div>
          <table class="plop-cheatsheet-table">
            <thead>
              <tr>
                <th>Value</th>
                <th>Cut</th>
                <th>Distances</th>
              </tr>
            </thead>
            <tbody>
              <For each={RANKS}>
                {(rank) => {
                  const entry = PLOP_DATA[rank]
                  return (
                    <tr classList={{ 'plop-cheatsheet-highlight': question().card === rank }}>
                      <td class="plop-cheatsheet-rank">{rank}</td>
                      <td><CardText card={entry.cutCard} /></td>
                      <td class="plop-cheatsheet-distances">{entry.distances.join(', ')}</td>
                    </tr>
                  )
                }}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
      <form class="quartet-form" onSubmit={event => { event.preventDefault(); handleSubmit(event); }}>
        {/* Suit selector */}
        <div class="plop-section">
          <label class="plop-label">Cut to bottom:</label>
          <div class="plop-suit-buttons" role="radiogroup" aria-label="Select suit to cut to bottom">
            <For each={SUIT_SYMBOLS}>
              {(suit) => {
                const isRed = () => suit === '♥' || suit === '♦'
                return (
                  <button
                    type="button"
                    class="plop-suit-btn"
                    classList={{
                      'plop-suit-btn-selected': selectedSuit() === suit,
                      'plop-suit-btn-wrong': answered() && wrongSuit() && selectedSuit() === suit,
                      'plop-suit-btn-red': isRed(),
                      'plop-suit-btn-black': !isRed(),
                    }}
                    onClick={() => handleSuitSelect(suit)}
                    disabled={answered()}
                    role="radio"
                    aria-checked={selectedSuit() === suit}
                    aria-label={`Suit ${suit}`}
                    tabindex={0}
                  >
                    {suit}
                  </button>
                )
              }}
            </For>
          </div>
        </div>

        {/* Distance inputs */}
        <div class="plop-section">
          <label class="plop-label">Relative distances:</label>
          <div class="plop-distance-labels">
            <span class="plop-distance-label">1st from top</span>
            <span class="plop-distance-label">1st → 2nd</span>
            <span class="plop-distance-label">2nd → 3rd</span>
          </div>
          <div class="quartet-inputs">
            {[0, 1, 2].map(index => (
              <input
                class={`quartet-input${wrongIndexes().includes(index) ? ' quartet-input-wrong' : ''}`}
                type="number"
                min="1"
                max="52"
                value={inputs()[index]}
                onInput={event => handleInput(index, (event.target as HTMLInputElement).value)}
                onKeyDown={event => handleKeyDown(event as KeyboardEvent, index)}
                ref={element => inputRefs[index] = element as HTMLInputElement}
                required
                aria-label={
                  index === 0
                    ? 'Position of first card from top'
                    : index === 1
                    ? 'Distance from first to second card'
                    : 'Distance from second to third card'
                }
              />
            ))}
          </div>
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
        <button class="submit-btn" type="submit" disabled={answered()}>
          Submit
        </button>
      </form>
    </div>
  )
}
