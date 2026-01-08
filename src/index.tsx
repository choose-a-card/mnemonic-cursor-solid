/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App'
import { HashRouter, Navigate, Route } from '@solidjs/router'
import StackPage from './pages/StackPage'
import PracticePage from './pages/PracticePage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import StackBuilderPage from './pages/StackBuilderPage'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

render(() => (
  <HashRouter root={App}>
    <Route path="/" component={() => <Navigate href="/stack" />} />
    <Route path="/stack" component={StackPage} />
    <Route path="/practice" component={PracticePage} />
    <Route path="/practice/:modeId" component={PracticePage} />
    <Route path="/stats" component={StatsPage} />
    <Route path="/settings" component={SettingsPage} />
    <Route path="/stack-builder" component={StackBuilderPage} />
    <Route path="/stack-builder/:id" component={StackBuilderPage} />
  </HashRouter>
), root!)
