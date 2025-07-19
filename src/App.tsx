import { createSignal, type Component, onMount, createEffect } from 'solid-js'
import StackView from './components/Stack/StackView'
import PracticeView from './components/Practice/PracticeView'
import StatsView from './components/Stats/StatsView'
import SettingsView from './components/Settings/SettingsView'
import { getStack, getStackTitle, type StackType } from './constants/stacks'
import type { TabInfo, CardInterval } from './types'
import { StatsProvider, useStats } from './contexts/StatsContext'
import { saveToLocalStorage, loadFromLocalStorage } from './utils/pwa'
import './App.css'

const TABS: TabInfo[] = [
  { label: 'Stack', icon: '📜', id: 'stack' },
  { label: 'Practice', icon: '🎯', id: 'practice' },
  { label: 'Stats', icon: '📊', id: 'stats' },
  { label: 'Settings', icon: '⚙️', id: 'settings' },
]

interface AppContentProps {
  debugMode: boolean;
}

const AppContent: Component<AppContentProps> = (props) => {
  const [tab, setTab] = createSignal<number>(0)
  const [stackType, setStackType] = createSignal<StackType>('tamariz')
  const [cardInterval, setCardInterval] = createSignal<CardInterval>({ start: 1, end: 52 })
  const [darkMode, setDarkMode] = createSignal<boolean>(false)
  const [soundEnabled, setSoundEnabled] = createSignal<boolean>(true)

  // Load settings from localStorage on mount
  onMount(() => {
    const savedStackType = loadFromLocalStorage<StackType>('mnemonic-stack-type', 'tamariz')
    const savedCardInterval = loadFromLocalStorage<CardInterval>('mnemonic-card-interval', { start: 1, end: 52 })
    const savedDarkMode = loadFromLocalStorage<boolean>('mnemonic-dark-mode', false)
    const savedSoundEnabled = loadFromLocalStorage<boolean>('mnemonic-sound-enabled', true)
    
    setStackType(savedStackType)
    setCardInterval(savedCardInterval)
    setDarkMode(savedDarkMode)
    setSoundEnabled(savedSoundEnabled)
  })

  const { addResult, resetStats, generateDebugStats } = useStats()

  // Save settings to localStorage whenever they change
  createEffect(() => {
    saveToLocalStorage('mnemonic-stack-type', stackType())
  })

  createEffect(() => {
    saveToLocalStorage('mnemonic-card-interval', cardInterval())
  })

  createEffect(() => {
    saveToLocalStorage('mnemonic-dark-mode', darkMode())
  })

  createEffect(() => {
    saveToLocalStorage('mnemonic-sound-enabled', soundEnabled())
  })

  const stack = (): string[] => getStack(stackType())
  const stackTitle = (): string => getStackTitle(stackType())

  // Clamp cardInterval to valid ranges
  const setCardIntervalClamped = (interval: CardInterval) => {
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

  const handleTabClick = (tabIndex: number) => {
    setTab(tabIndex)
  }

  const handleKeyDown = (event: KeyboardEvent, tabIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleTabClick(tabIndex)
    }
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
            onResult={addResult}
            soundEnabled={soundEnabled()}
          />
        )}
        {tab() === 2 && (
          <StatsView
            stack={stack()}
            onGenerateDebugStats={props.debugMode ? (() => {
              console.log('AppContent: Debug function called, debugMode:', props.debugMode)
              generateDebugStats()
            }) : undefined}
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
            onResetStats={resetStats}
          />
        )}
      </main>
      <nav class="bottom-nav" role="tablist" aria-label="Main navigation">
        {TABS.map((t, i) => (
          <button
            class={tab() === i ? 'nav-item active' : 'nav-item'}
            onClick={() => handleTabClick(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            type="button"
            role="tab"
            aria-selected={tab() === i}
            tabindex={tab() === i ? 0 : -1}
            aria-label={`${t.label} tab`}
          >
            <span class="nav-icon" aria-hidden="true">{t.icon}</span>
            <span class="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

const App: Component = () => {
  const [debugMode, setDebugMode] = createSignal<boolean>(false)
  const [stackType, setStackType] = createSignal<StackType>('tamariz')

  const stack = (): string[] => getStack(stackType())

  // Check for debug flag in URL on mount
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugFlag = urlParams.get('debug')
    if (debugFlag === 'true') {
      setDebugMode(true)
      console.log('Debug mode enabled via URL parameter')
    }
  })

  return (
    <StatsProvider debugMode={debugMode()} stack={stack}>
      <AppContent debugMode={debugMode()} />
    </StatsProvider>
  )
}

export default App