import { createSignal, type Component, onMount } from 'solid-js'
import { type RouteSectionProps } from '@solidjs/router'
import { getStack, type StackType } from './constants/stacks'
import { StatsProvider } from './contexts/StatsContext'
import { AppSettingsProvider, useAppSettings } from './contexts/AppSettingsContext'
import Navigation from './components/Navigation/Navigation'
import './App.css'

const AppContent: Component<RouteSectionProps> = (props) => {
  const { darkMode } = useAppSettings()
  const [debugMode, setDebugMode] = createSignal<boolean>(false)
  const [stackType] = createSignal<StackType>('tamariz')

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
      <div class={`app-container ${darkMode() ? 'dark' : ''}`}>
        <div class="main-content">
          {props.children}
        </div>
        <Navigation />
      </div>
    </StatsProvider>
  )
}

const App: Component<RouteSectionProps> = (props) => {
  const [debugMode, setDebugMode] = createSignal<boolean>(false)

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
    <AppSettingsProvider debugMode={debugMode()}>
      <AppContent {...props} />
    </AppSettingsProvider>
  )
}

export default App