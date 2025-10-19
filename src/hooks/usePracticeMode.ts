import { createSignal } from 'solid-js'
import type { QuizQuestion, QuizResult } from '../types'
import { playSound } from '../sounds/sounds'
import { FEEDBACK_TIMER_MS } from '../constants/timers'

interface UsePracticeModeOptions {
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
  mode: string;
  nextQuestionGenerator: () => QuizQuestion;
  validateAnswer?: (input: string, question: QuizQuestion) => boolean;
}

export const usePracticeMode = (options: UsePracticeModeOptions) => {
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)

  const nextQuestion = (): void => {
    setFeedback('')
    setInput('')
    const newQuestion = options.nextQuestionGenerator()
    setQuestion(newQuestion)
  }

  const submitAnswer = (): void => {
    const q = question()
    const userAnswer = input().toUpperCase().replace(/\s+/g, '')
    const correctAnswer = String(q.answer).replace(/\s+/g, '').toUpperCase()
    
    let correct = false
    if (options.validateAnswer) {
      correct = options.validateAnswer(input(), q)
    } else {
      correct = userAnswer === correctAnswer
    }

    playSound(options.soundEnabled, correct ? 'correct' : 'incorrect')

    if (correct) {
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Wrong. Answer: ${q.answer}`)
    }

    options.onResult({
      correct,
      question: q,
      input: input(),
      mode: options.mode
    })
  }

  const submitAndContinue = (): void => {
    submitAnswer()
    setTimeout(nextQuestion, FEEDBACK_TIMER_MS)
  }

  return {
    question,
    input,
    feedback,
    showKeyboard,
    setInput,
    setShowKeyboard,
    setQuestion,
    nextQuestion,
    submitAnswer,
    submitAndContinue
  }
}

