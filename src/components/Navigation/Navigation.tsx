import { type Component, For } from 'solid-js'
import { useLocation, A } from '@solidjs/router'
import './Navigation.css'

const TABS = [
  { label: 'Stack', icon: '📜', path: '/stack' },
  { label: 'Practice', icon: '🎯', path: '/practice' },
  { label: 'Stats', icon: '📊', path: '/stats' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
]

const Navigation: Component = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    // For practice route, also match sub-routes like /practice/card-to-pos
    if (path === '/practice') {
      return location.pathname === path || location.pathname.startsWith('/practice/')
    }
    return location.pathname === path
  }

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <nav class="desktop-sidebar" role="navigation" aria-label="Main navigation">
        <div class="sidebar-content">
          <For each={TABS}>
            {(tab) => (
              <A
                href={tab.path}
                class={isActive(tab.path) ? 'sidebar-item active' : 'sidebar-item'}
                tabindex={0}
                aria-label={`${tab.label} tab`}
                aria-current={isActive(tab.path) ? 'page' : undefined}
              >
                <span class="sidebar-icon" aria-hidden="true">{tab.icon}</span>
                <span class="sidebar-label">{tab.label}</span>
              </A>
            )}
          </For>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav class="bottom-nav" role="tablist" aria-label="Main navigation">
        <For each={TABS}>
          {(tab) => (
            <A
              href={tab.path}
              class={isActive(tab.path) ? 'nav-item active' : 'nav-item'}
              role="tab"
              aria-selected={isActive(tab.path)}
              tabindex={isActive(tab.path) ? 0 : -1}
              aria-label={`${tab.label} tab`}
              onClick={(e) => {
                // Remove focus on touch devices to prevent stuck hover state
                if ('ontouchstart' in window) {
                  const target = e.currentTarget as HTMLAnchorElement
                  setTimeout(() => target.blur(), 0)
                }
              }}
            >
              <span class="nav-icon" aria-hidden="true">{tab.icon}</span>
              <span class="nav-label">{tab.label}</span>
            </A>
          )}
        </For>
      </nav>
    </>
  )
}

export default Navigation 