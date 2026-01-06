import { createSignal } from 'solid-js'
import type { QuizQuestion, QuizResult } from '../types'
import { playSound } from '../sounds/sounds'


interface UseCardQuizOptions {
  soundEnabled: boolean;
  onResult: (result: QuizResult) => void;
  mode: string;
}

export function useCardQuiz(options: UseCardQuizOptions) {
  const [question, setQuestion] = createSignal<QuizQuestion>({} as QuizQuestion)
  const [input, setInput] = createSignal<string>('')
  const [feedback, setFeedback] = createSignal<string | null>(null)
  const [feedbackCard, setFeedbackCard] = createSignal<string | null>(null)
  const [isCorrect, setIsCorrect] = createSignal<boolean>(false)
  const [showKeyboard, setShowKeyboard] = createSignal<boolean>(false)

  function updateQuestion(newQuestion: QuizQuestion): void {
    setFeedback(null)
    setFeedbackCard(null)
    setIsCorrect(false)
    setInput('')
    setQuestion(newQuestion)
  }

  function submitAnswer(): void {
    const q = question()
    const userAnswer = input().toUpperCase().replace(/\s+/g,'')
    const correctAnswer = String(q.answer).replace(/\s+/g,'').toUpperCase()
    let correct = userAnswer === correctAnswer

    // Special handling for first-or-second-half mode: accept 'first', 'first half', '1', 'one' for first half, and similar for second half
    if (q.type === 'first-or-second-half') {
      const firstHalfAnswers = ['FIRST', 'FIRSTHALF', '1', 'ONE']
      const secondHalfAnswers = ['SECOND', 'SECONDHALF', '2', 'TWO']
      if (correctAnswer === 'FIRSTHALF') {
        correct = firstHalfAnswers.includes(userAnswer)
      } else if (correctAnswer === 'SECONDHALF') {
        correct = secondHalfAnswers.includes(userAnswer)
      }
    }
    
    playSound(options.soundEnabled, correct ? 'correct' : 'incorrect')
    setIsCorrect(correct)
    
    if (correct) {
      setFeedback('Correct! ✅')
      setFeedbackCard(null)
    } else {
      // Check if answer is a card (contains suit symbol)
      const answerStr = String(q.answer)
      const isCardAnswer = answerStr.includes('♥') || answerStr.includes('♦') || 
                           answerStr.includes('♠') || answerStr.includes('♣')
      if (isCardAnswer) {
        setFeedback('Wrong. Answer: ')
        setFeedbackCard(answerStr)
      } else {
        setFeedback(`Wrong. Answer: ${q.answer}`)
        setFeedbackCard(null)
      }
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
    feedbackCard,
    isCorrect,
    showKeyboard,
    setInput,
    setShowKeyboard,
    updateQuestion,
    submitAnswer
  }
}
