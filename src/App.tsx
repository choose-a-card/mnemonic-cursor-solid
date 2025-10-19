import { type Component } from 'solid-js'
import { type RouteSectionProps } from '@solidjs/router'
import { StatsProvider } from './contexts/StatsContext'
import { AppSettingsProvider } from './contexts/AppSettingsContext'
import { useDebugMode } from './hooks/useDebugMode'
import AppLayout from './layouts/AppLayout'
import './App.css'

const AppContent: Component<RouteSectionProps> = (props) => {
  return (
    <AppLayout>
      {props.children}
    </AppLayout>
  )
}

const App: Component<RouteSectionProps> = (props) => {
  const { debugMode } = useDebugMode()

  return (
    <AppSettingsProvider debugMode={debugMode()}>
      <StatsProvider debugMode={debugMode()} stack={() => []}>
        <AppContent {...props} />
      </StatsProvider>
    </AppSettingsProvider>
  )
}

export default App
