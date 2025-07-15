import { createMemo } from 'solid-js'
import './StatsView.css'
import type { Stats } from '../../types'

function topN(obj: Record<string, number>, n: number, labeler: (key: string) => string) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ label: labeler(k), count: v }))
}

function getAISuggestions(stats: Stats, stack: string[]) {
  const suggestions = []
  const { history, cardFails, posFails, total, correct } = stats
  
  if (total === 0) return ['Start practicing to get personalized suggestions!']
  
  const accuracy = (correct / total) * 100
  
  // Overall accuracy suggestions with more specific guidance
  if (accuracy < 40) {
    suggestions.push('Focus on memorizing the first 10 cards thoroughly. Start with Card → Position mode.')
  } else if (accuracy < 60) {
    suggestions.push('You\'re building a foundation! Practice positions 1-20 in smaller chunks of 5 cards.')
  } else if (accuracy < 75) {
    suggestions.push('Good progress! Try One Ahead mode to strengthen your card-to-card connections.')
  } else if (accuracy < 85) {
    suggestions.push('Excellent! Focus on your most missed cards. Try Stack Context mode for advanced practice.')
  } else if (accuracy < 95) {
    suggestions.push('Outstanding accuracy! Challenge yourself with Cutting Estimation to test your stack knowledge.')
  } else {
    suggestions.push('Master level! Try practicing with the full 52-card stack or switch to a different stack.')
  }
  
  // Position-based suggestions with specific ranges
  const positionFailures = Object.entries(posFails)
  if (positionFailures.length > 0) {
    const highestFailPos = positionFailures.reduce((a, b) => a[1] > b[1] ? a : b)
    const pos = Number(highestFailPos[0])
    const failCount = highestFailPos[1]
    
    if (pos <= 10) {
      suggestions.push(`Focus on positions 1-10 (${failCount} failures). These are your foundation cards.`)
    } else if (pos <= 20) {
      suggestions.push(`Practice positions 11-20 more (${failCount} failures). Build your middle section.`)
    } else if (pos <= 30) {
      suggestions.push(`Strengthen positions 21-30 (${failCount} failures). This section needs attention.`)
    } else if (pos <= 40) {
      suggestions.push(`Work on positions 31-40 (${failCount} failures). The upper section is challenging.`)
    } else {
      suggestions.push(`Focus on the final positions 41-52 (${failCount} failures). End-game cards need practice.`)
    }
  }
  
  // Card-specific suggestions
  const cardFailures = Object.entries(cardFails)
  if (cardFailures.length > 0) {
    const topFailedCard = cardFailures.reduce((a, b) => a[1] > b[1] ? a : b)
    const card = topFailedCard[0]
    const failCount = topFailedCard[1]
    
    if (failCount >= 3) {
      suggestions.push(`Card ${card} is your biggest challenge (${failCount} failures). Practice it specifically.`)
    }
  }
  
  // Mode-specific suggestions based on history
  const recentModes = history.slice(-20).map(h => h.mode)
  const modeCounts = recentModes.reduce((acc, mode) => {
    acc[mode] = (acc[mode] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostUsedMode = Object.entries(modeCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])
  
  if (mostUsedMode[1] > 10) {
    const mode = mostUsedMode[0]
    if (mode === 'Card → Position') {
      suggestions.push('Try Position → Card mode to strengthen your position recall.')
    } else if (mode === 'Position → Card') {
      suggestions.push('Switch to Card → Position mode to improve your card recognition.')
    } else if (mode === 'One Ahead') {
      suggestions.push('Great! Try Stack Context mode to test your contextual memory.')
    } else if (mode === 'Stack Context') {
      suggestions.push('Excellent! Challenge yourself with Cutting Estimation mode.')
    }
  }
  
  // Practice frequency suggestions
  if (total < 20) {
    suggestions.push('Practice more frequently! Aim for at least 50 attempts to see meaningful patterns.')
  } else if (total < 100) {
    suggestions.push('Good practice frequency! Try to practice daily for consistent improvement.')
  }
  
  // Recent performance trends
  const recentAccuracy = history.slice(-10).filter(h => h.correct).length / Math.min(10, history.length) * 100
  if (recentAccuracy > accuracy + 10) {
    suggestions.push('You\'re improving! Your recent performance is better than your overall average.')
  } else if (recentAccuracy < accuracy - 10) {
    suggestions.push('Focus on consistency. Your recent performance has dipped slightly.')
  }
  
  return suggestions.slice(0, 3) // Limit to 3 suggestions
}

function createAccuracyChart(history: any[]) {
  if (history.length < 2) return null
  
  // Group by sessions (every 10 attempts)
  const sessions = []
  for (let i = 0; i < history.length; i += 10) {
    const session = history.slice(i, i + 10)
    const accuracy = (session.filter(h => h.correct).length / session.length) * 100
    sessions.push({ session: Math.floor(i / 10) + 1, accuracy })
  }
  
  // Only show the last 8 sessions to prevent overflow
  return sessions.slice(-8)
}

interface StatsViewProps {
  stats: Stats;
  stack: string[];
  onGenerateDebugStats?: (() => void) | undefined;
}

export default function StatsView(props: StatsViewProps) {
  
  console.log('StatsView rendered with stats:', props.stats)
  
  const topCards = createMemo(() => topN(props.stats.cardFails, 5, c => c))
  const topPos = createMemo(() => topN(props.stats.posFails, 5, p => `${p} (${props.stack[Number(p)-1] || ''})`))
  const accuracy = createMemo(() => props.stats.total ? Math.round((props.stats.correct / props.stats.total) * 100) : 100)

  const suggestions = createMemo(() => getAISuggestions(props.stats, props.stack))
  const chartData = createMemo(() => createAccuracyChart(props.stats.history))

  return (
    <div class="stats-view">
      <div class="stats-overview">
        <div class="accuracy-circle">
          <div class="accuracy-value">{accuracy()}%</div>
          <div class="accuracy-label">Overall Accuracy</div>
        </div>
        <div class="quick-stats">
          <div class="quick-stat">
            <div class="stat-value">{props.stats.total}</div>
            <div class="stat-label">Total Attempts</div>
          </div>
          <div class="quick-stat">
            <div class="stat-value">{props.stats.correct}</div>
            <div class="stat-label">Correct</div>
          </div>
        </div>
      </div>

      {/* Debug Button - only show if debug function is provided */}
      {props.onGenerateDebugStats && (
        <div class="debug-section">
          <button 
            class="debug-button" 
            onClick={props.onGenerateDebugStats}
            type="button"
          >
            🧪 Generate 1000 Debug Results
          </button>
        </div>
      )}

      {chartData() && chartData()!.length > 1 && (
        <div class="stats-block">
          <div class="stats-title">📈 Accuracy Trend</div>
          <div class="chart-explanation">
            Shows your accuracy over practice sessions (10 attempts each). Higher bars = better performance.
          </div>
          <div class="accuracy-chart">
            {(chartData() || []).map((session, i) => {
              let barClass = 'bar-fill'
              if (session.accuracy === 100) {
                barClass = 'bar-fill perfect'
              } else if (session.accuracy < 50) {
                barClass = 'bar-fill poor'
              } else {
                barClass = 'bar-fill good'
              }
              
              return (
                <div class="chart-bar">
                  <div 
                    class={barClass}
                    style={{ height: `${session.accuracy}%` }}
                    title={`Session ${session.session}: ${session.accuracy.toFixed(1)}%`}
                  ></div>
                  <div class="bar-label">{session.session}</div>
                </div>
              )
            })}
          </div>
          <div class="chart-footer">
            Latest {(chartData() || []).length} sessions • Each bar = 10 attempts
          </div>
        </div>
      )}

      <div class="stats-block">
        <div class="stats-title">🤖 AI Suggestions</div>
        <ul class="suggestions-list">
          {(suggestions() || []).map((suggestion, i) => (
            <li class="suggestion-item">{suggestion}</li>
          ))}
        </ul>
      </div>

      <div class="stats-block">
        <div class="stats-title">🎯 Most Missed Cards</div>
        <ul class="stats-list">
          {topCards().length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
          {topCards().map((item, i) => (
            <li class="stats-item">
              <span class="card-display">{item.label}</span>
              <span class="stats-count">×{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div class="stats-block">
        <div class="stats-title">📍 Most Missed Positions</div>
        <ul class="stats-list">
          {topPos().length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
          {topPos().map((item, i) => (
            <li class="stats-item">
              <span class="position-display">{item.label}</span>
              <span class="stats-count">×{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {props.stats.history.length > 0 && (
        <div class="stats-block">
          <div class="stats-title">📊 Recent Performance</div>
          <div class="recent-attempts">
            {props.stats.history.slice(-20).map((attempt, i) => (
              <div 
                class={`attempt-dot ${attempt.correct ? 'correct' : 'incorrect'}`}
                title={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
              ></div>
            ))}
          </div>
          <div class="recent-label">Last 20 attempts</div>
        </div>
      )}
    </div>
  )
} 