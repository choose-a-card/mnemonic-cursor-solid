import { createContext, useContext, createSignal, createMemo, createEffect, onMount, type Component, type JSX } from 'solid-js'
import type { Stats, Badge } from '../types'
import { calculateBadgeProgress } from '../utils/badges'
import { initializePWA, saveToLocalStorage, loadFromLocalStorage, isOnline, onOnlineStatusChange } from '../utils/pwa'
import { isFeatureEnabled } from '../utils/featureFlags'

interface StatsContextValue {
  stats: () => Stats
  addResult: (result: any) => void
  resetStats: () => void
  generateDebugStats: () => void
  badges: () => Badge[]
  lastUnlockedBadge: () => Badge | null
  isOnline: () => boolean
}

const StatsContext = createContext<StatsContextValue>()

interface StatsProviderProps {
  children: JSX.Element
  debugMode: boolean
  stack: () => string[]
}

export const StatsProvider: Component<StatsProviderProps> = (props) => {
  const [stats, setStats] = createSignal<Stats>({
    cardFails: {},
    posFails: {},
    total: 0,
    correct: 0,
    history: [],
    modeStats: {}
  })

  const [lastUnlockedBadge, setLastUnlockedBadge] = createSignal<Badge | null>(null)
  const [previousBadges, setPreviousBadges] = createSignal<Badge[]>([])
  const [onlineStatus, setOnlineStatus] = createSignal<boolean>(true)

  // Initialize PWA features (only if enabled)
  onMount(() => {
    if (isFeatureEnabled('pwaEnabled')) {
      initializePWA()
    }
    setOnlineStatus(isOnline())
    onOnlineStatusChange(setOnlineStatus)
    
    // Load stats from localStorage
    const savedStats = loadFromLocalStorage<Stats>('mnemonic-stats', {
      cardFails: {},
      posFails: {},
      total: 0,
      correct: 0,
      history: [],
      modeStats: {}
    })
    setStats(savedStats)
  })

  // Calculate badges from current stats (only if badges are enabled)
  const badges = createMemo(() => {
    if (!isFeatureEnabled('badgesEnabled')) {
      return []
    }
    const currentStats = stats()
    return calculateBadgeProgress(currentStats)
  })

  // Track badge unlocks using an effect (only if badges are enabled)
  createEffect(() => {
    if (!isFeatureEnabled('badgesEnabled')) {
      setLastUnlockedBadge(null)
      setPreviousBadges([])
      return
    }
    
    const currentBadges = badges()
    const prevBadges = previousBadges()
    
    // Check for newly unlocked badges
    const newlyUnlocked = currentBadges.filter(badge => 
      badge.unlocked && !prevBadges.find(pb => pb.id === badge.id && pb.unlocked)
    )
    
    if (newlyUnlocked.length > 0) {
      setLastUnlockedBadge(newlyUnlocked[0])
      // Auto-clear after 3 seconds
      setTimeout(() => setLastUnlockedBadge(null), 3000)
    }
    
    // Update previous badges for next comparison
    setPreviousBadges(currentBadges)
  })

  // Persist stats to localStorage whenever they change
  createEffect(() => {
    const currentStats = stats()
    saveToLocalStorage('mnemonic-stats', currentStats)
  })

  const addResult = (result: any) => {
    const currentStats = stats()
    const { correct, question, input, mode } = result
    
    // Update basic stats
    const newStats = {
      ...currentStats,
      total: currentStats.total + 1,
      correct: currentStats.correct + (correct ? 1 : 0)
    }
    
    // Update card failures
    if (!correct && question.card) {
      newStats.cardFails = {
        ...newStats.cardFails,
        [question.card]: (newStats.cardFails[question.card] || 0) + 1
      }
    }
    
    // Update position failures
    if (!correct && question.pos) {
      newStats.posFails = {
        ...newStats.posFails,
        [question.pos.toString()]: (newStats.posFails[question.pos.toString()] || 0) + 1
      }
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
      timestamp: Date.now(),
      correct,
      mode,
      question,
      input
    })
    
    setStats(newStats)
  }

  const resetStats = () => {
    const emptyStats = {
      cardFails: {},
      posFails: {},
      total: 0,
      correct: 0,
      history: [],
      modeStats: {}
    }
    setStats(emptyStats)
    setLastUnlockedBadge(null)
    saveToLocalStorage('mnemonic-stats', emptyStats)
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
        timestamp: Date.now() - (10000 - i) * 60000, // Spread over time
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

  const value: StatsContextValue = {
    stats,
    addResult,
    resetStats,
    generateDebugStats,
    badges,
    lastUnlockedBadge,
    isOnline: onlineStatus
  }

  return (
    <StatsContext.Provider value={value}>
      {props.children}
    </StatsContext.Provider>
  )
}

export const useStats = () => {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
} 