import type { Badge, Stats } from '../types'

// Badge definitions
export const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt' | 'progress' | 'maxProgress'>[] = [
  // Accuracy badges
  {
    id: 'first-correct',
    name: 'First Steps',
    description: 'Get your first correct answer',
    icon: '🎯',
    category: 'accuracy',
    requirement: 1
  },
  {
    id: 'accuracy-50',
    name: 'Consistent',
    description: 'Achieve 50% accuracy',
    icon: '📈',
    category: 'accuracy',
    requirement: 50
  },
  {
    id: 'accuracy-70',
    name: 'Skilled',
    description: 'Achieve 70% accuracy',
    icon: '⭐',
    category: 'accuracy',
    requirement: 70
  },
  {
    id: 'accuracy-85',
    name: 'Expert',
    description: 'Achieve 85% accuracy',
    icon: '🏆',
    category: 'accuracy',
    requirement: 85
  },
  {
    id: 'accuracy-95',
    name: 'Master',
    description: 'Achieve 95% accuracy',
    icon: '👑',
    category: 'accuracy',
    requirement: 95
  },
  {
    id: 'accuracy-100',
    name: 'Perfect',
    description: 'Achieve 100% accuracy',
    icon: '💎',
    category: 'accuracy',
    requirement: 100
  },

  // Practice badges
  {
    id: 'practice-10',
    name: 'Getting Started',
    description: 'Complete 10 practice attempts',
    icon: '🚀',
    category: 'practice',
    requirement: 10
  },
  {
    id: 'practice-50',
    name: 'Dedicated',
    description: 'Complete 50 practice attempts',
    icon: '💪',
    category: 'practice',
    requirement: 50
  },
  {
    id: 'practice-100',
    name: 'Committed',
    description: 'Complete 100 practice attempts',
    icon: '🔥',
    category: 'practice',
    requirement: 100
  },
  {
    id: 'practice-500',
    name: 'Devoted',
    description: 'Complete 500 practice attempts',
    icon: '⚡',
    category: 'practice',
    requirement: 500
  },
  {
    id: 'practice-1000',
    name: 'Legendary',
    description: 'Complete 1000 practice attempts',
    icon: '🌟',
    category: 'practice',
    requirement: 1000
  },

  // Mode badges
  {
    id: 'mode-explorer',
    name: 'Mode Explorer',
    description: 'Try 3 different practice modes',
    icon: '🔍',
    category: 'modes',
    requirement: 3
  },
  {
    id: 'mode-master',
    name: 'Mode Master',
    description: 'Try all 8 practice modes',
    icon: '🎭',
    category: 'modes',
    requirement: 8
  },
  {
    id: 'card-to-position-expert',
    name: 'Card Reader',
    description: 'Achieve 80% accuracy in Card → Position mode',
    icon: '🎴',
    category: 'modes',
    requirement: 80
  },
  {
    id: 'position-to-card-expert',
    name: 'Position Finder',
    description: 'Achieve 80% accuracy in Position → Card mode',
    icon: '📍',
    category: 'modes',
    requirement: 80
  },
  {
    id: 'one-ahead-expert',
    name: 'One Step Ahead',
    description: 'Achieve 70% accuracy in One Ahead mode',
    icon: '⏭️',
    category: 'modes',
    requirement: 70
  },
  {
    id: 'stack-context-expert',
    name: 'Context Master',
    description: 'Achieve 75% accuracy in Stack Context mode',
    icon: '🔗',
    category: 'modes',
    requirement: 75
  },
  {
    id: 'cutting-expert',
    name: 'Cutting Expert',
    description: 'Achieve 60% accuracy in Cutting Estimation mode',
    icon: '✂️',
    category: 'modes',
    requirement: 60
  },
  {
    id: 'quartet-expert',
    name: 'Quartet Master',
    description: 'Achieve 65% accuracy in Quartet Position mode',
    icon: '🎭',
    category: 'modes',
    requirement: 65
  },
  {
    id: 'cut-to-position-expert',
    name: 'Cut to Position Master',
    description: 'Achieve 55% accuracy in Cut to Position mode',
    icon: '🎯',
    category: 'modes',
    requirement: 55
  },

  // Streak badges
  {
    id: 'streak-3',
    name: 'Hot Streak',
    description: 'Get 3 correct answers in a row',
    icon: '🔥',
    category: 'streaks',
    requirement: 3
  },
  {
    id: 'streak-5',
    name: 'On Fire',
    description: 'Get 5 correct answers in a row',
    icon: '⚡',
    category: 'streaks',
    requirement: 5
  },
  {
    id: 'streak-10',
    name: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    icon: '🚀',
    category: 'streaks',
    requirement: 10
  },
  {
    id: 'streak-20',
    name: 'Legendary Streak',
    description: 'Get 20 correct answers in a row',
    icon: '👑',
    category: 'streaks',
    requirement: 20
  },

  // Milestone badges
  {
    id: 'first-100',
    name: 'Century',
    description: 'Complete 100 total attempts',
    icon: '💯',
    category: 'milestones',
    requirement: 100
  },
  {
    id: 'first-500',
    name: 'Half Millennium',
    description: 'Complete 500 total attempts',
    icon: '🎯',
    category: 'milestones',
    requirement: 500
  },
  {
    id: 'first-1000',
    name: 'Millennium',
    description: 'Complete 1000 total attempts',
    icon: '🏆',
    category: 'milestones',
    requirement: 1000
  },
  {
    id: 'perfect-session',
    name: 'Perfect Session',
    description: 'Get 10 correct answers in a single session',
    icon: '💎',
    category: 'milestones',
    requirement: 10
  },
  {
    id: 'all-modes-50',
    name: 'Well Rounded',
    description: 'Achieve at least 50% accuracy in all practice modes',
    icon: '🎪',
    category: 'milestones',
    requirement: 50
  }
]

// Calculate current streak from history
const calculateCurrentStreak = (history: any[]): number => {
  let streak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].correct) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// Calculate max streak from history
const calculateMaxStreak = (history: any[]): number => {
  let maxStreak = 0
  let currentStreak = 0
  
  for (const attempt of history) {
    if (attempt.correct) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }
  
  return maxStreak
}

// Check if all modes have at least X% accuracy
const checkAllModesAccuracy = (modeStats: Record<string, any>, minAccuracy: number): boolean => {
  const modes = Object.keys(modeStats)
  if (modes.length === 0) return false
  
  return modes.every(mode => {
    const stats = modeStats[mode]
    return stats.total >= 5 && stats.accuracy >= minAccuracy
  })
}

// Calculate badge progress and unlock status
export const calculateBadgeProgress = (stats: Stats): Badge[] => {
  const { total, correct, history, modeStats } = stats
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const uniqueModes = new Set(history.map(h => h.mode)).size
  const currentStreak = calculateCurrentStreak(history)
  const maxStreak = calculateMaxStreak(history)
  
  // Calculate session streaks (consecutive correct in recent history)
  const recentHistory = history.slice(-10)
  const sessionStreak = recentHistory.filter(h => h.correct).length
  
  return BADGE_DEFINITIONS.map(badge => {
    let progress = 0
    let maxProgress = badge.requirement
    let unlocked = false
    
    switch (badge.id) {
      // Accuracy badges
      case 'first-correct':
        progress = correct
        unlocked = correct >= 1
        break
      case 'accuracy-50':
      case 'accuracy-70':
      case 'accuracy-85':
      case 'accuracy-95':
      case 'accuracy-100':
        progress = accuracy
        unlocked = accuracy >= badge.requirement
        break
      
      // Practice badges
      case 'practice-10':
      case 'practice-50':
      case 'practice-100':
      case 'practice-500':
      case 'practice-1000':
        progress = total
        unlocked = total >= badge.requirement
        break
      
      // Mode badges
      case 'mode-explorer':
        progress = uniqueModes
        unlocked = uniqueModes >= 3
        break
      case 'mode-master':
        progress = uniqueModes
        unlocked = uniqueModes >= 8
        break
      case 'card-to-position-expert':
        progress = modeStats['Card → Position']?.accuracy || 0
        unlocked = (modeStats['Card → Position']?.accuracy || 0) >= 80
        break
      case 'position-to-card-expert':
        progress = modeStats['Position → Card']?.accuracy || 0
        unlocked = (modeStats['Position → Card']?.accuracy || 0) >= 80
        break
      case 'one-ahead-expert':
        progress = modeStats['One Ahead']?.accuracy || 0
        unlocked = (modeStats['One Ahead']?.accuracy || 0) >= 70
        break
      case 'stack-context-expert':
        progress = modeStats['Stack Context']?.accuracy || 0
        unlocked = (modeStats['Stack Context']?.accuracy || 0) >= 75
        break
      case 'cutting-expert':
        progress = modeStats['Cutting Estimation']?.accuracy || 0
        unlocked = (modeStats['Cutting Estimation']?.accuracy || 0) >= 60
        break
      case 'quartet-expert':
        progress = modeStats['Quartet Position']?.accuracy || 0
        unlocked = (modeStats['Quartet Position']?.accuracy || 0) >= 65
        break
      case 'cut-to-position-expert':
        progress = modeStats['Cut to Position']?.accuracy || 0
        unlocked = (modeStats['Cut to Position']?.accuracy || 0) >= 55
        break
      
      // Streak badges
      case 'streak-3':
      case 'streak-5':
      case 'streak-10':
      case 'streak-20':
        progress = maxStreak
        unlocked = maxStreak >= badge.requirement
        break
      
      // Milestone badges
      case 'first-100':
      case 'first-500':
      case 'first-1000':
        progress = total
        unlocked = total >= badge.requirement
        break
      case 'perfect-session':
        progress = sessionStreak
        unlocked = sessionStreak >= 10
        break
      case 'all-modes-50':
        progress = checkAllModesAccuracy(modeStats, 50) ? 100 : 0
        unlocked = checkAllModesAccuracy(modeStats, 50)
        break
    }
    
    return {
      ...badge,
      unlocked,
      unlockedAt: unlocked ? Date.now() : undefined,
      progress: Math.min(progress, maxProgress),
      maxProgress
    }
  })
}

// Get category display info
export const getCategoryInfo = (category: string) => {
  const categoryMap = {
    accuracy: { name: 'Accuracy', icon: '📊', color: '#28a745' },
    practice: { name: 'Practice', icon: '💪', color: '#007bff' },
    modes: { name: 'Modes', icon: '🎮', color: '#6f42c1' },
    streaks: { name: 'Streaks', icon: '🔥', color: '#fd7e14' },
    milestones: { name: 'Milestones', icon: '🏆', color: '#ffc107' }
  }
  return categoryMap[category as keyof typeof categoryMap] || { name: 'Other', icon: '⭐', color: '#6c757d' }
} 