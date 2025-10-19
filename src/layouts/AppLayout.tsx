import { type Component, type JSX, createEffect, onMount } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { useAppSettings } from '../contexts/AppSettingsContext'
import Navigation from '../components/Navigation/Navigation'
import './AppLayout.css'

interface AppLayoutProps {
  children: JSX.Element;
}

const AppLayout: Component<AppLayoutProps> = (props) => {
  const { darkMode } = useAppSettings()
  const location = useLocation()
  let mainContentRef: HTMLDivElement | undefined

  // Reset scroll to top on route change
  createEffect(() => {
    const path = location.pathname
    if (mainContentRef) {
      mainContentRef.scrollTo({ top: 0, behavior: 'instant' })
    }
  })

  // Also reset on mount
  onMount(() => {
    if (mainContentRef) {
      mainContentRef.scrollTop = 0
    }
  })

  return (
    <div class={`app-container ${darkMode() ? 'dark' : ''}`}>
      <div class="main-content" ref={mainContentRef}>
        {props.children}
      </div>
      <Navigation />
    </div>
  )
}

export default AppLayout

