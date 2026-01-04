import { createContext, useContext, createSignal, createMemo, createEffect, onMount, type Component, type JSX } from 'solid-js'
import type { Stats, Badge, QuizResult } from '../types'
import { calculateBadgeProgress } from '../utils/badges'
import { initializePWA, saveToLocalStorage, loadFromLocalStorage, isOnline, onOnlineStatusChange } from '../utils/pwa'
import { isFeatureEnabled } from '../utils/featureFlags'
import { logger } from '../utils/logger'

// Maximum history entries to prevent unbounded growth
const MAX_HISTORY_ENTRIES = 100000

interface StatsContextValue {
  stats: () => Stats
  addResult: (result: QuizResult) => void
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
    const savedStats = loadFromLocalStorage<any>('mnemonic-stats', {
      total: 0,
      correct: 0,
      history: [],
      modeStats: {}
    })

    // MIGRATION: Remove old global cardFails/posFails if they exist
    const migratedStats: Stats = {
      total: savedStats.total || 0,
      correct: savedStats.correct || 0,
      history: savedStats.history || [],
      modeStats: savedStats.modeStats || {}
    }
    // Ignore old cardFails and posFails fields
    
    setStats(migratedStats)
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

  const addResult = (result: QuizResult) => {
    const currentStats = stats()
    const { correct, question, input, mode } = result
    
    // Update basic stats
    const newStats: Stats = {
      ...currentStats,
      total: currentStats.total + 1,
      correct: currentStats.correct + (correct ? 1 : 0),
      history: [...currentStats.history],
      modeStats: { ...currentStats.modeStats }
    }
    
    // Initialize mode stats if not exists
    if (!newStats.modeStats[mode]) {
      newStats.modeStats[mode] = { 
        total: 0, 
        correct: 0, 
        accuracy: 0,
        cardFails: {},
        posFails: {},
        lastAttempt: Date.now()
      }
    }
    
    // Update mode-specific failures (context-aware!)
    const modeStats = { ...newStats.modeStats[mode] }
    if (!correct) {
      // Track card failures per mode
      if (question.card) {
        if (!modeStats.cardFails) modeStats.cardFails = {}
        modeStats.cardFails[question.card] = (modeStats.cardFails[question.card] || 0) + 1
      }
      
      // Track position failures per mode
      if (question.pos) {
        if (!modeStats.posFails) modeStats.posFails = {}
        const posKey = question.pos.toString()
        modeStats.posFails[posKey] = (modeStats.posFails[posKey] || 0) + 1
      }
    }
    
    // Update mode stats
    modeStats.total++
    if (correct) modeStats.correct++
    modeStats.accuracy = Math.round((modeStats.correct / modeStats.total) * 100)
    modeStats.lastAttempt = Date.now()
    newStats.modeStats[mode] = modeStats
    
    // Add to history (with limit to prevent unbounded growth)
    newStats.history.push({
      timestamp: Date.now(),
      correct,
      mode,
      question,
      input
    })
    
    // Trim history if it exceeds the maximum
    if (newStats.history.length > MAX_HISTORY_ENTRIES) {
      newStats.history = newStats.history.slice(-MAX_HISTORY_ENTRIES)
    }
    
    setStats(newStats)
  }

  const resetStats = () => {
    const emptyStats: Stats = {
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
    logger.log('StatsContext: generateDebugStats called')
    const currentStack = props.stack()
    const modes = ['Card → Position', 'Position → Card', 'One Ahead', 'Stack Context', 'Cutting Estimation', 'First or Second Half', 'Quartet Position', 'Cut to Position']
    const newStats: Stats = { 
      total: 0, 
      correct: 0, 
      history: [], 
      modeStats: {} 
    }
    
    logger.log('StatsContext: Generating 10000 debug results...')
    for (let i = 0; i < 10000; i++) {
      const mode = modes[Math.floor(Math.random() * modes.length)]
      const correct = Math.random() > 0.3 // 70% accuracy for realistic data
      const cardIdx = Math.floor(Math.random() * currentStack.length)
      const card = currentStack[cardIdx]
      const pos = cardIdx + 1
      
      newStats.total++
      if (correct) {
        newStats.correct++
      }
      
      // Initialize mode stats if not exists
      if (!newStats.modeStats[mode]) {
        newStats.modeStats[mode] = { 
          total: 0, 
          correct: 0, 
          accuracy: 0,
          cardFails: {},
          posFails: {},
          lastAttempt: Date.now()
        }
      }
      
      // Update mode-specific failures
      const modeStats = newStats.modeStats[mode]
      if (!correct) {
        if (!modeStats.cardFails) modeStats.cardFails = {}
        if (!modeStats.posFails) modeStats.posFails = {}
        modeStats.cardFails[card] = (modeStats.cardFails[card] || 0) + 1
        modeStats.posFails[pos.toString()] = (modeStats.posFails[pos.toString()] || 0) + 1
      }
      
      // Update mode stats
      modeStats.total++
      if (correct) modeStats.correct++
      modeStats.accuracy = Math.round((modeStats.correct / modeStats.total) * 100)
      
      // Add to history
      newStats.history.push({
        timestamp: Date.now() - (10000 - i) * 60000, // Spread over time
        correct,
        mode,
        question: { card, pos, answer: pos, type: 'card-to-pos' },
        input: correct ? card : 'wrong'
      })
    }
    
    logger.log('StatsContext: Setting new stats:', newStats)
    setStats(newStats)
    logger.log('StatsContext: Stats updated successfully')
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
