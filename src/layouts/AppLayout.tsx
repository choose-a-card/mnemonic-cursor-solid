import { type Component, type JSX, createEffect, onMount, Show, createMemo } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { useAppSettings } from '../contexts/AppSettingsContext'
import Navigation from '../components/Navigation/Navigation'
import './AppLayout.css'

interface AppLayoutProps {
  children: JSX.Element;
}

// Routes that should hide the bottom navigation
const FULL_SCREEN_ROUTES = ['/stack-builder']

const AppLayout: Component<AppLayoutProps> = (props) => {
  const { darkMode } = useAppSettings()
  const location = useLocation()
  let mainContentRef: HTMLDivElement | undefined

  const isFullScreenRoute = createMemo(() => {
    return FULL_SCREEN_ROUTES.some(route => location.pathname.startsWith(route))
  })

  // Reset scroll to top on route change
  createEffect(() => {
    // Track pathname changes
    location.pathname
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
      <div class={`main-content ${isFullScreenRoute() ? 'full-screen' : ''}`} ref={mainContentRef}>
        {props.children}
      </div>
      <Show when={!isFullScreenRoute()}>
        <Navigation />
      </Show>
    </div>
  )
}

export default AppLayout

