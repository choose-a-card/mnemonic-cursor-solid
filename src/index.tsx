/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App'
import { HashRouter, Navigate, Route } from '@solidjs/router'
import PracticeView from './components/Practice/PracticeView'
import SettingsView from './components/Settings/SettingsView'
import StackView from './components/Stack/StackView'
import StatsView from './components/Stats/StatsView'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

render(() => (
  <HashRouter root={App}>
    <Route path="/" component={() => <Navigate href="/stack" />} />
            <Route path="/stack" component={StackView} />
            <Route path="/practice" component={PracticeView} />
            <Route path="/stats" component={StatsView} />
            <Route path="/settings" component={SettingsView} />
  </HashRouter>
), root!)
