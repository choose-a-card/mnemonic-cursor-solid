import { createSignal, onMount } from 'solid-js'
import type { QuizQuestion } from '../../types'
import { playSound } from '../../sounds/sounds'
import { getRandomInt } from '../../utils/utils'
import { FEEDBACK_TIMER_MS } from '../../constants/timers'
import { RANKS, SUITS } from '../../constants/cards'
import { usePractice } from '../../contexts/PracticeContext'
import CardText from '../shared/CardText'
import NumericKeyboard from '../shared/NumericKeyboard'

export default function QuartetPosition() {
  const { stack, soundEnabled, onResult } = usePractice()
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [inputs, setInputs] = createSignal<string[]>(['', '', '', ''])
  const [feedback, setFeedback] = createSignal<string>('')
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const [answered, setAnswered] = createSignal<boolean>(false)
  const [wrongIndexes, setWrongIndexes] = createSignal<number[]>([])
  const [activeIndex, setActiveIndex] = createSignal<number>(0)

  const nextQuestion = (): void => {
    setFeedback('')
    setIsCorrect(false)
    setAnswered(false)
    setInputs(['', '', '', ''])
    setWrongIndexes([])
    setActiveIndex(0)

    const rankIdx = getRandomInt(RANKS.length)
    const rank = RANKS[rankIdx]
    const quartetCards = SUITS.map(suit => rank + suit.symbol)
    const positions = stack().reduce((acc, current, index) => {
      if (quartetCards.includes(current)) {
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

  const handleNumericDigit = (digit: string): void => {
    const idx = activeIndex()
    const newInputs = [...inputs()]
    newInputs[idx] = newInputs[idx] + digit
    setInputs(newInputs)
  }

  const handleNumericDelete = (): void => {
    const idx = activeIndex()
    const newInputs = [...inputs()]
    newInputs[idx] = newInputs[idx].slice(0, -1)
    setInputs(newInputs)
  }

  const handleNumericSubmit = (): void => {
    const idx = activeIndex()
    // If not on last field, advance to next
    if (idx < 3) {
      setActiveIndex(idx + 1)
      return
    }
    // On last field, submit the answer
    handleSubmitAnswer()
  }

  const handleSubmitAnswer = (): void => {
    if (answered()) return

    const userPositions = inputs().map(value => Number(value)).filter(Boolean)
    const correctPositions = String(question().answer).split(',').map((pos: string) => Number(pos))
    const sortedUserPositions = [...userPositions].sort((a, b) => a - b)
    const sortedCorrectPositions = [...correctPositions].sort((a, b) => a - b)

    const correct =
      userPositions.length === 4 &&
      sortedUserPositions.every((pos, index) => pos === sortedCorrectPositions[index])

    let wrongs: number[] = []
    if (!correct) {
      wrongs = inputs().map((value, index) => {
        const numValue = Number(value)
        return numValue && !correctPositions.includes(numValue) ? index : -1
      }).filter(index => index !== -1)
      setWrongIndexes(wrongs)
    } else {
      setWrongIndexes([])
    }

    playSound(soundEnabled(), correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)
    setFeedback(correct ? 'Correct! ✅' : `Wrong. Positions: ${correctPositions.join(', ')}`)
    setAnswered(true)

    onResult({
      correct,
      question: question(),
      input: inputs().join(','),
      mode: 'Quartet Position'
    })

    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  const handleInputFocus = (index: number): void => {
    setActiveIndex(index)
  }

  const handleInputKeyDown = (event: KeyboardEvent, index: number): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (index < 3) {
        setActiveIndex(index + 1)
      } else {
        handleSubmitAnswer()
      }
    }
  }

  onMount(() => {
    nextQuestion()
  })

  return (
    <div class="practice-mode">
      <div class="question-card">
        <div class="question-text">
          Enter the positions of all the <b><CardText card={question().card || ''} />s</b> in the stack:
        </div>
      </div>
      <div class="quartet-form">
        <div class="quartet-inputs">
          {[0, 1, 2, 3].map(index => (
            <input
              class={`quartet-input${wrongIndexes().includes(index) ? ' quartet-input-wrong' : ''}${activeIndex() === index ? ' quartet-input-active' : ''}`}
              type="text"
              value={inputs()[index]}
              onInput={(event) => {
                const filtered = (event.target as HTMLInputElement).value.replace(/\D/g, '')
                const newInputs = [...inputs()]
                newInputs[index] = filtered
                setInputs(newInputs)
              }}
              onFocus={() => handleInputFocus(index)}
              onKeyDown={(event) => handleInputKeyDown(event as KeyboardEvent, index)}
              aria-label={`Position ${index + 1}`}
              inputmode="none"
              autocomplete="off"
            />
          ))}
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

        <NumericKeyboard
          isVisible={true}
          onDigit={handleNumericDigit}
          onDelete={handleNumericDelete}
          onSubmit={handleNumericSubmit}
        />
      </div>
    </div>
  )
} 