import { createContext, createSignal, useContext, type Component, type JSX } from 'solid-js'
import type { Stats, QuizResult } from '../types'

interface StatsContextValue {
  stats: () => Stats
  addResult: (result: QuizResult) => void
  resetStats: () => void
  generateDebugStats: () => void
}

const StatsContext = createContext<StatsContextValue>()

const useStats = () => {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}

interface StatsProviderProps {
  children: JSX.Element
  debugMode?: boolean
  stack: () => string[]
}

export const StatsProvider: Component<StatsProviderProps> = (props) => {
  const [stats, setStats] = createSignal<Stats>({
    cardFails: {},
    posFails: {},
    total: 0,
    correct: 0,
    history: [],
    modeStats: {},
  })

  const addResult = (result: QuizResult): void => {
    const { correct, question, input, mode } = result
    setStats(prev => {
      const s = { ...prev }
      s.total++
      if (correct) s.correct++
      
      // Add to history for charts
      s.history.push({
        timestamp: Date.now(),
        correct,
        mode,
        question,
        input
      })
      
      // Update mode-specific stats
      if (!s.modeStats[mode]) {
        s.modeStats[mode] = { total: 0, correct: 0, accuracy: 0 }
      }
      s.modeStats[mode].total++
      if (correct) s.modeStats[mode].correct++
      s.modeStats[mode].accuracy = Math.round((s.modeStats[mode].correct / s.modeStats[mode].total) * 100)
      
      if (!correct) {
        if (question.card) {
          s.cardFails[question.card] = (s.cardFails[question.card] || 0) + 1
        }
        if (question.pos) {
          s.posFails[question.pos] = (s.posFails[question.pos] || 0) + 1
        }
      }
      return s
    })
  }

  const resetStats = (): void => {
    setStats({ cardFails: {}, posFails: {}, total: 0, correct: 0, history: [], modeStats: {} })
  }

  const generateDebugStats = (): void => {
    console.log('StatsContext: generateDebugStats called')
    console.log('StatsContext: current stack:', props.stack())
    const currentStack = props.stack()
    const modes = ['Card → Position', 'Position → Card', 'One Ahead', 'Stack Context', 'Cutting Estimation', 'First or Second Half', 'Quartet Position', 'Cut to Position']
    const newStats: Stats = { cardFails: {}, posFails: {}, total: 0, correct: 0, history: [], modeStats: {} }
    
    console.log('StatsContext: Generating 10000 debug results...')
    for (let i = 0; i < 10000; i++) {
      const mode = modes[Math.floor(Math.random() * modes.length)]
      const correct = Math.random() > 0.3 // 70% accuracy for realistic data
      const cardIdx = Math.floor(Math.random() * currentStack.length)
      const card = currentStack[cardIdx]
      const pos = cardIdx + 1
      
      newStats.total++
      if (correct) {
        newStats.correct++
      } else {
        // Add failures to tracking
        newStats.cardFails[card] = (newStats.cardFails[card] || 0) + 1
        newStats.posFails[pos.toString()] = (newStats.posFails[pos.toString()] || 0) + 1
      }
      
      // Update mode stats
      if (!newStats.modeStats[mode]) {
        newStats.modeStats[mode] = { total: 0, correct: 0, accuracy: 0 }
      }
      newStats.modeStats[mode].total++
      if (correct) newStats.modeStats[mode].correct++
      newStats.modeStats[mode].accuracy = Math.round((newStats.modeStats[mode].correct / newStats.modeStats[mode].total) * 100)
      
      // Add to history
      newStats.history.push({
        timestamp: Date.now() - (1000 - i) * 60000, // Spread over time
        correct,
        mode,
        question: { card, pos, answer: pos, type: 'card-to-pos' },
        input: correct ? card : 'wrong'
      })
    }
    
    console.log('StatsContext: Setting new stats:', newStats)
    setStats(newStats)
    console.log('StatsContext: Stats updated successfully')
  }

  const contextValue: StatsContextValue = {
    stats,
    addResult,
    resetStats,
    generateDebugStats: props.debugMode ? generateDebugStats : () => {},
  }

  return (
    <StatsContext.Provider value={contextValue}>
      {props.children}
    </StatsContext.Provider>
  )
}

export { useStats } 