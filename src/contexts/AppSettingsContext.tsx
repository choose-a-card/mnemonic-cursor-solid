import { createContext, useContext, createSignal, type Component, onMount, createEffect } from 'solid-js'
import type { CardInterval } from '../types'
import type { StackType } from '../constants/stacks'
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/pwa'

interface AppSettingsContextType {
  stackType: () => StackType
  setStackType: (type: StackType) => void
  cardInterval: () => CardInterval
  setCardInterval: (interval: CardInterval) => void
  darkMode: () => boolean
  setDarkMode: (mode: boolean) => void
  soundEnabled: () => boolean
  setSoundEnabled: (enabled: boolean) => void
  debugMode: boolean
}

const AppSettingsContext = createContext<AppSettingsContextType>()

export const AppSettingsProvider: Component<{ children: any; debugMode: boolean }> = (props) => {
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

  // Clamp cardInterval to valid ranges
  const setCardIntervalClamped = (interval: CardInterval) => {
    const start = Math.max(1, Math.min(52, interval.start))
    const end = Math.max(1, Math.min(52, interval.end))
    setCardInterval({ start: Math.min(start, end), end: Math.max(start, end) })
  }

  const contextValue: AppSettingsContextType = {
    stackType,
    setStackType,
    cardInterval,
    setCardInterval: setCardIntervalClamped,
    darkMode,
    setDarkMode,
    soundEnabled,
    setSoundEnabled,
    debugMode: props.debugMode
  }

  return (
    <AppSettingsContext.Provider value={contextValue}>
      {props.children}
    </AppSettingsContext.Provider>
  )
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }
  return context
} 