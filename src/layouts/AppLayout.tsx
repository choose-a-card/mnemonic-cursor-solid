import { type Component, type JSX } from 'solid-js'
import { useAppSettings } from '../contexts/AppSettingsContext'
import Navigation from '../components/Navigation/Navigation'
import './AppLayout.css'

interface AppLayoutProps {
  children: JSX.Element;
}

const AppLayout: Component<AppLayoutProps> = (props) => {
  const { darkMode } = useAppSettings()

  return (
    <div class={`app-container ${darkMode() ? 'dark' : ''}`}>
      <div class="main-content">
        {props.children}
      </div>
      <Navigation />
    </div>
  )
}

export default AppLayout

