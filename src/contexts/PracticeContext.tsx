import { createContext, useContext, type Component, type JSX } from 'solid-js'
import type { CardInterval, QuizResult } from '../types'
import { useAppSettings } from './AppSettingsContext'
import { useCustomStacks } from './CustomStacksContext'
import { useStats } from './StatsContext'
import { getStack } from '../constants/stacks'

interface PracticeContextValue {
  stack: () => string[];
  practiceStack: () => string[];
  cardInterval: () => CardInterval;
  soundEnabled: () => boolean;
  onResult: (result: QuizResult) => void;
}

const PracticeContext = createContext<PracticeContextValue>()

interface PracticeProviderProps {
  children: JSX.Element;
}

export const PracticeProvider: Component<PracticeProviderProps> = (props) => {
  const { stackType, cardInterval, soundEnabled } = useAppSettings()
  const { customStacks } = useCustomStacks()
  const { addResult } = useStats()
  
  const stack = () => getStack(stackType(), customStacks())
  const practiceStack = () => stack().slice(cardInterval().start - 1, cardInterval().end)

  const value: PracticeContextValue = {
    stack,
    practiceStack,
    cardInterval,
    soundEnabled,
    onResult: addResult
  }

  return (
    <PracticeContext.Provider value={value}>
      {props.children}
    </PracticeContext.Provider>
  )
}

export const usePractice = () => {
  const context = useContext(PracticeContext)
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider')
  }
  return context
}

