import { createMemo, type Component } from 'solid-js'
import type { Badge } from '../../types'
import { getCategoryInfo } from '../../utils/badges'
import { isFeatureEnabled } from '../../utils/featureFlags'
import './BadgeDisplay.css'

interface BadgeDisplayProps {
  badges: Badge[]
  lastUnlockedBadge: Badge | null
}

const BadgeDisplay: Component<BadgeDisplayProps> = (props) => {
  // Early return if badges are disabled
  if (!isFeatureEnabled('badgesEnabled')) {
    return null
  }

  // Group badges by category
  const badgesByCategory = createMemo(() => {
    const grouped = props.badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = []
      }
      acc[badge.category].push(badge)
      return acc
    }, {} as Record<string, Badge[]>)
    
    // Sort categories by unlocked count
    return Object.entries(grouped).sort((a, b) => {
      const aUnlocked = a[1].filter(b => b.unlocked).length
      const bUnlocked = b[1].filter(b => b.unlocked).length
      return bUnlocked - aUnlocked
    })
  })

  const totalBadges = createMemo(() => props.badges.length)
  const unlockedBadges = createMemo(() => props.badges.filter(b => b.unlocked).length)
  const completionPercentage = createMemo(() => Math.round((unlockedBadges() / totalBadges()) * 100))

  const handleBadgeClick = (badge: Badge) => {
    // Could add badge details modal here
    console.log('Badge clicked:', badge)
  }

  const handleBadgeKeyDown = (event: KeyboardEvent, badge: Badge) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBadgeClick(badge)
    }
  }

  return (
    <div class="badge-display">
      {/* Badge Overview */}
      <div class="badge-overview">
        <div class="badge-summary">
          <div class="badge-count">
            <span class="badge-count-number">{unlockedBadges()}</span>
            <span class="badge-count-label">of {totalBadges()} badges</span>
          </div>
          <div class="badge-progress">
            <div class="badge-progress-bar">
              <div 
                class="badge-progress-fill" 
                style={{ width: `${completionPercentage()}%` }}
              ></div>
            </div>
            <span class="badge-progress-text">{completionPercentage()}% complete</span>
          </div>
        </div>
      </div>

      {/* Badge Categories */}
      <div class="badge-categories">
        {badgesByCategory().map(([category, badges]) => {
          const categoryInfo = getCategoryInfo(category)
          const categoryUnlocked = badges.filter(b => b.unlocked).length
          const categoryTotal = badges.length
          
          return (
            <div class="badge-category">
              <div class="badge-category-header">
                <div class="badge-category-info">
                  <span class="badge-category-icon" style={{ color: categoryInfo.color }}>
                    {categoryInfo.icon}
                  </span>
                  <span class="badge-category-name">{categoryInfo.name}</span>
                  <span class="badge-category-count">
                    {categoryUnlocked}/{categoryTotal}
                  </span>
                </div>
                <div class="badge-category-progress">
                  <div class="badge-category-progress-bar">
                    <div 
                      class="badge-category-progress-fill"
                      style={{ 
                        width: `${Math.round((categoryUnlocked / categoryTotal) * 100)}%`,
                        'background-color': categoryInfo.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div class="badge-grid">
                {badges.map((badge) => (
                  <div 
                    class={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'} ${props.lastUnlockedBadge?.id === badge.id ? 'newly-unlocked' : ''}`}
                    onClick={() => handleBadgeClick(badge)}
                    onKeyDown={(e) => handleBadgeKeyDown(e, badge)}
                    tabindex={0}
                    role="button"
                    aria-label={`${badge.name} badge - ${badge.unlocked ? 'Unlocked' : 'Locked'}`}
                  >
                    <div class="badge-icon">
                      {badge.unlocked ? badge.icon : '🔒'}
                    </div>
                    <div class="badge-info">
                      <div class="badge-name">{badge.name}</div>
                      <div class="badge-description">{badge.description}</div>
                      {!badge.unlocked && (
                        <div class="badge-progress-info">
                          <div class="badge-progress-mini">
                            <div 
                              class="badge-progress-mini-fill"
                              style={{ width: `${Math.round((badge.progress / badge.maxProgress) * 100)}%` }}
                            ></div>
                          </div>
                          <span class="badge-progress-text-mini">
                            {badge.progress}/{badge.maxProgress}
                          </span>
                        </div>
                      )}
                    </div>
                    {badge.unlocked && (
                      <div class="badge-unlock-indicator">
                        <span class="badge-unlock-icon">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Badge Notification */}
      {props.lastUnlockedBadge && (
        <div class="badge-notification">
          <div class="badge-notification-content">
            <span class="badge-notification-icon">🎉</span>
            <div class="badge-notification-text">
              <div class="badge-notification-title">New Badge Unlocked!</div>
              <div class="badge-notification-badge">
                {props.lastUnlockedBadge.icon} {props.lastUnlockedBadge.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BadgeDisplay 