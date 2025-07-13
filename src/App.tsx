import { createSignal, type Component } from 'solid-js'
import StackView from './components/Stack/StackView'
import PracticeView from './components/Practice/PracticeView'
import StatsView from './components/Stats/StatsView'
import SettingsView from './components/Settings/SettingsView'
import { getStack, getStackTitle, type StackType } from './constants/stacks'
import type { Stats, TabInfo, QuizResult } from './types'
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
  const [numCards, setNumCards] = createSignal<number>(52)
  const [darkMode, setDarkMode] = createSignal<boolean>(false)
  const [soundEnabled, setSoundEnabled] = createSignal<boolean>(true)

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
            numCards={numCards()}
            onResult={handleQuizzResult}
            soundEnabled={soundEnabled()}
          />
        )}
        {tab() === 2 && (
          <StatsView
            stats={stats()}
            stack={stack()}
          />
        )}
        {tab() === 3 && (
          <SettingsView
            stackType={stackType()}
            setStackType={setStackType}
            numCards={numCards()}
            setNumCards={setNumCards}
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
