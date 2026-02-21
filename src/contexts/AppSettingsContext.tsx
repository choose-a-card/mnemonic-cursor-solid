import { createContext, useContext, createSignal, type Component, onMount, createEffect, type JSX } from 'solid-js'
import type { CardInterval } from '../types'
import type { StackType } from '../constants/stacks'
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/pwa'
import { trackEvent } from '../utils/analytics'
import {
  STACK_TYPE_CHANGED,
  CARD_INTERVAL_CHANGED,
  SETTING_DARK_MODE_CHANGED,
  SETTING_SOUND_CHANGED,
} from '../constants/analyticsEvents'

interface AppSettingsContextType {
  stackType: () => StackType
  setStackType: (type: StackType) => void
  cardInterval: () => CardInterval
  setCardInterval: (interval: CardInterval) => void
  /** Call when user commits the card range (e.g. releases slider). Used for analytics only. */
  onCardIntervalCommit: (interval: CardInterval) => void
  darkMode: () => boolean
  setDarkMode: (mode: boolean) => void
  soundEnabled: () => boolean
  setSoundEnabled: (enabled: boolean) => void
  debugMode: boolean
}

interface AppSettingsProviderProps {
  children: JSX.Element
  debugMode: boolean
}

const AppSettingsContext = createContext<AppSettingsContextType>()

export const AppSettingsProvider: Component<AppSettingsProviderProps> = (props) => {
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

  // Tracked setters — only fire events for user-initiated changes (after mount)
  const handleSetStackType = (type: StackType) => {
    const previous = stackType()
    setStackType(type)
    trackEvent(STACK_TYPE_CHANGED, {
      from_stack: previous,
      to_stack: type,
    })
  }

  const handleSetCardInterval = (interval: CardInterval) => {
    setCardIntervalClamped(interval)
  }

  const handleCardIntervalCommit = (interval: CardInterval) => {
    trackEvent(CARD_INTERVAL_CHANGED, {
      range_start: interval.start,
      range_end: interval.end,
      range_size: interval.end - interval.start + 1,
    })
  }

  const handleSetDarkMode = (mode: boolean) => {
    setDarkMode(mode)
    trackEvent(SETTING_DARK_MODE_CHANGED, { enabled: mode })
  }

  const handleSetSoundEnabled = (enabled: boolean) => {
    setSoundEnabled(enabled)
    trackEvent(SETTING_SOUND_CHANGED, { enabled })
  }

  const contextValue: AppSettingsContextType = {
    stackType,
    setStackType: handleSetStackType,
    cardInterval,
    setCardInterval: handleSetCardInterval,
    onCardIntervalCommit: handleCardIntervalCommit,
    darkMode,
    setDarkMode: handleSetDarkMode,
    soundEnabled,
    setSoundEnabled: handleSetSoundEnabled,
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