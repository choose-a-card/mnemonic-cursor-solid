import { createSignal, type Component, onMount } from 'solid-js'
import StackView from './components/Stack/StackView'
import PracticeView from './components/Practice/PracticeView'
import StatsView from './components/Stats/StatsView'
import SettingsView from './components/Settings/SettingsView'
import { getStack, getStackTitle, type StackType } from './constants/stacks'
import type { Stats, TabInfo, QuizResult, CardInterval } from './types'
import './App.css'

const TABS: TabInfo[] = [
  { label: 'Stack', icon: '📜', id: 'stack' },
  { label: 'Practice', icon: '🎯', id: 'practice' },
  { label: 'Stats', icon: '📊', id: 'stats' },
  { label: 'Settings', icon: '⚙️', id: 'settings' },
]

const App: Component = () => {
  const [tab, setTab] = createSignal<number>(0)
  const [stackType, setStackType] = createSignal<StackType>('tamariz')
  const [cardInterval, setCardInterval] = createSignal<CardInterval>({ start: 1, end: 52 })
  const [darkMode, setDarkMode] = createSignal<boolean>(false)
  const [soundEnabled, setSoundEnabled] = createSignal<boolean>(true)
  const [debugMode, setDebugMode] = createSignal<boolean>(false)

  // Stats state
  const [stats, setStats] = createSignal<Stats>({
    cardFails: {},
    posFails: {},
    total: 0,
    correct: 0,
    history: [],
  })

  const stack = (): string[] => getStack(stackType())
  const stackTitle = (): string => getStackTitle(stackType())

  // Clamp cardInterval to valid ranges
  function setCardIntervalClamped(interval: CardInterval) {
    const start = Math.max(1, Math.min(52, interval.start))
    const end = Math.max(1, Math.min(52, interval.end))
    setCardInterval({ start: Math.min(start, end), end: Math.max(start, end) })
  }

  // Get the practice stack based on interval
  const practiceStack = (): string[] => {
    const interval = cardInterval()
    return stack().slice(interval.start - 1, interval.end)
  }

  // Get the number of cards in the practice range
  const numCards = (): number => {
    const interval = cardInterval()
    return interval.end - interval.start + 1
  }

  // Check for debug flag in URL on mount
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugFlag = urlParams.get('debug')
    if (debugFlag === 'true') {
      setDebugMode(true)
      console.log('Debug mode enabled via URL parameter')
    }
  })

  function handleQuizzResult(result: QuizResult): void {
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

  function handleResetStats(): void {
    setStats({ cardFails: {}, posFails: {}, total: 0, correct: 0, history: [] })
  }

  function generateDebugStats(): void {
    console.log('generateDebugStats called')
    const currentStack = stack()
    const modes = ['Card → Position', 'Position → Card', 'One Ahead', 'Stack Context', 'Cutting Estimation']
    const newStats: Stats = { cardFails: {}, posFails: {}, total: 0, correct: 0, history: [] }
    
    for (let i = 0; i < 1000; i++) {
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
      
      // Add to history
      newStats.history.push({
        timestamp: Date.now() - (1000 - i) * 60000, // Spread over time
        correct,
        mode,
        question: { card, pos, answer: pos, type: 'card-to-pos' },
        input: correct ? card : 'wrong'
      })
    }
    
    console.log('Setting new stats:', newStats)
    setStats(newStats)
    console.log('Stats updated')
  }

  return (
    <div class={`app-container ${darkMode() ? 'dark' : ''}`}>
      <main class="main-content">
        {tab() === 0 && (
          <StackView
            stack={stack().slice(0, numCards())}
            title={stackTitle()}
          />
        )}
        {tab() === 1 && (
          <PracticeView
            stack={stack()}
            practiceStack={practiceStack()}
            cardInterval={cardInterval()}
            onResult={handleQuizzResult}
            soundEnabled={soundEnabled()}
          />
        )}
        {tab() === 2 && (
          <StatsView
            stats={stats()}
            stack={stack()}
            onGenerateDebugStats={debugMode() ? generateDebugStats : undefined}
          />
        )}
        {tab() === 3 && (
          <SettingsView
            stackType={stackType()}
            setStackType={setStackType}
            cardInterval={cardInterval()}
            setCardInterval={setCardIntervalClamped}
            darkMode={darkMode()}
            setDarkMode={setDarkMode}
            soundEnabled={soundEnabled()}
            setSoundEnabled={setSoundEnabled}
            onResetStats={handleResetStats}
          />
        )}
      </main>
      <nav class="bottom-nav">
        {TABS.map((t, i) => (
          <button
            class={tab() === i ? 'nav-item active' : 'nav-item'}
            onClick={() => setTab(i)}
            type="button"
          >
            <span class="nav-icon">{t.icon}</span>
            <span class="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App