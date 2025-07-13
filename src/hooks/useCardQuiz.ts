import { createSignal, createEffect } from 'solid-js'
import type { QuizQuestion, QuizResult } from '../types'
import { playSound } from '../sounds/sounds'
import { FEEDBACK_TIMER_MS } from '../constants/timers'

interface UseCardQuizOptions {
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
  mode: string;
}

export function useCardQuiz(options: UseCardQuizOptions) {
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string>('')
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)

  function updateQuestion(newQuestion: QuizQuestion): void {
    setFeedback('')
    setInput('')
    setQuestion(newQuestion)
  }

  function submitAnswer(): void {
    const q = question()
    const userAnswer = input().toUpperCase().replace(/\s+/g,'')
    const correctAnswer = String(q.answer).replace(/\s+/g,'').toUpperCase()
    const correct = userAnswer === correctAnswer
    
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

  return {
    question,
    input,
    feedback,
    showKeyboard,
    setInput,
    setShowKeyboard,
    updateQuestion,
    submitAnswer
  }
} 