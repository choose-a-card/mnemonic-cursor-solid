import type { Stats } from '../types'

export const topN = (
  obj: Record<string, number>, 
  n: number, 
  labeler: (key: string) => string
): { label: string; count: number }[] => {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ label: labeler(k), count: v }))
}

export const calculateAccuracy = (correct: number, total: number): number => {
  return total > 0 ? Math.round((correct / total) * 100) : 100
}

export const calculateRecentAccuracy = (history: any[], count: number): number => {
  const recent = history.slice(-count)
  return recent.length > 0 
    ? Math.round((recent.filter(h => h.correct).length / recent.length) * 100) 
    : 0
}

export const calculateCurrentStreak = (history: any[]): number => {
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

export const calculateTrend = (history: any[]): string => {
  const last10 = history.slice(-10)
  const last20 = history.slice(-20, -10)
  
  if (last10.length < 5 || last20.length < 5) {
    return '📊 Building data...'
  }
  
  const recentAccuracy = last10.filter(h => h.correct).length / last10.length
  const previousAccuracy = last20.filter(h => h.correct).length / last20.length
  
  if (recentAccuracy > previousAccuracy + 0.1) return '📈 Improving'
  if (recentAccuracy < previousAccuracy - 0.1) return '📉 Declining'
  return '➡️ Stable'
}

export const getModeStats = (
  stats: Stats, 
  modeName: string
): { accuracy: number; total: number } => {
  const modeStats = stats.modeStats[modeName]
  return modeStats 
    ? { accuracy: modeStats.accuracy, total: modeStats.total }
    : { accuracy: 0, total: 0 }
}

