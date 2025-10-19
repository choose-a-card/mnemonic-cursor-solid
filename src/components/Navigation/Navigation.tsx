import { type Component, createSignal, For, Show } from 'solid-js'
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
  const [isMenuOpen, setIsMenuOpen] = createSignal(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen())
  }

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      {/* Desktop Hamburger Menu */}
      <div class="desktop-menu">
        <button
          class="hamburger-button"
          onClick={handleToggleMenu}
          onKeyDown={handleKeyDown}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen()}
          tabindex={0}
        >
          <span class="hamburger-icon" aria-hidden="true">☰</span>
        </button>
        
        <Show when={isMenuOpen()}>
          <div class="menu-overlay" onClick={handleCloseMenu} />
          <nav class="desktop-nav" role="navigation" aria-label="Desktop navigation">
            <For each={TABS}>
              {(tab) => (
                <A
                  href={tab.path}
                  class={isActive(tab.path) ? 'menu-item active' : 'menu-item'}
                  onClick={handleCloseMenu}
                  tabindex={0}
                  aria-label={`${tab.label} tab`}
                >
                  <span class="menu-icon" aria-hidden="true">{tab.icon}</span>
                  <span class="menu-label">{tab.label}</span>
                </A>
              )}
            </For>
          </nav>
        </Show>
      </div>

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