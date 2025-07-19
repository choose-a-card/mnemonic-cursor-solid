import { createMemo, For } from 'solid-js'
import './StatsView.css'
import { useStats } from '../../contexts/StatsContext'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { getStack } from '../../constants/stacks'
import BadgeDisplay from './BadgeDisplay'
import { isFeatureEnabled } from '../../utils/featureFlags'

const topN = (obj: Record<string, number>, n: number, labeler: (key: string) => string) => {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ label: labeler(k), count: v }))
}



const createAccuracyChart = (history: any[]) => {
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

export default function StatsView() {
  const { stats, badges, lastUnlockedBadge, generateDebugStats } = useStats()
  const { stackType, debugMode } = useAppSettings()
  const stack = () => getStack(stackType())
  
  console.log('StatsView rendered with stats:', stats())
  console.log('StatsView debugMode:', debugMode)
  
  const topCards = createMemo(() => topN(stats().cardFails, 5, c => c))
  const topPos = createMemo(() => topN(stats().posFails, 5, p => `${p} (${stack()[Number(p)-1] || ''})`))
  const accuracy = createMemo(() => stats().total ? Math.round((stats().correct / stats().total) * 100) : 100)


  const chartData = createMemo(() => createAccuracyChart(stats().history))



  const handleDebugClick = () => {
    console.log('Debug button clicked, debugMode:', debugMode)
    if (debugMode && generateDebugStats) {
      console.log('Calling generateDebugStats')
      generateDebugStats()
    } else {
      console.log('generateDebugStats is not available')
    }
  }

  const handleDebugKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleDebugClick()
    }
  }

  return (
    <div class="stats-view">
      <div class="stats-overview">
        <div class="accuracy-circle">
          <div class="accuracy-value">{accuracy()}%</div>
          <div class="accuracy-label">Overall Accuracy</div>
        </div>
        <div class="quick-stats">
          <div class="quick-stat">
            <div class="stat-value">{stats().total}</div>
            <div class="stat-label">Total Attempts</div>
          </div>
          <div class="quick-stat">
            <div class="stat-value">{stats().correct}</div>
            <div class="stat-label">Correct</div>
          </div>
        </div>
      </div>

      {/* Debug Button - only show if debug function is provided */}
      {debugMode && (
        <div class="debug-section">
          <button 
            class="debug-button" 
            onClick={handleDebugClick}
            onKeyDown={handleDebugKeyDown}
            type="button"
            aria-label="Generate 10000 debug results for testing"
            tabindex={0}
          >
            🧪 Generate 10000 Debug Results
          </button>
        </div>
      )}



      {chartData() && chartData()!.length > 1 && (
        <div class="stats-block">
          <div class="stats-title">📈 Accuracy Trend</div>
          <div class="stats-block-content">
            <div class="chart-explanation">
              Shows your accuracy over practice sessions (10 attempts each). Higher bars = better performance.
            </div>
            <div class="accuracy-chart" role="img" aria-label="Accuracy trend chart">
              <For each={chartData() || []}>
                {(session) => {
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
                        role="img"
                        aria-label={`Session ${session.session} accuracy: ${session.accuracy.toFixed(1)}%`}
                      ></div>
                      <div class="bar-label">{session.session}</div>
                    </div>
                  )
                }}
              </For>
            </div>
            <div class="chart-footer">
              Latest {(chartData() || []).length} sessions • Each bar = 10 attempts
            </div>
          </div>
        </div>
      )}



      {/* Badges Section - only show if badges are enabled */}
      {isFeatureEnabled('badgesEnabled') && (
        <div class="stats-block">
          <div class="stats-title">🏆 Achievements</div>
          <div class="stats-block-content">
            <BadgeDisplay 
              badges={badges()} 
              lastUnlockedBadge={lastUnlockedBadge()} 
            />
          </div>
        </div>
      )}

      <div class="stats-block">
        <div class="stats-title">🎯 Most Missed Cards</div>
        <div class="stats-block-content">
          <ul class="stats-list" role="list" aria-label="Most frequently missed cards">
            {topCards().length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
            <For each={topCards()}>
              {(item) => (
                <li class="stats-item" role="listitem">
                  <span class="card-display">{item.label}</span>
                  <span class="stats-count">×{item.count}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>

      <div class="stats-block">
        <div class="stats-title">📍 Most Missed Positions</div>
        <div class="stats-block-content">
          <ul class="stats-list" role="list" aria-label="Most frequently missed positions">
            {topPos().length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
            <For each={topPos()}>
              {(item) => (
                <li class="stats-item" role="listitem">
                  <span class="position-display">{item.label}</span>
                  <span class="stats-count">×{item.count}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>

      {stats().history.length > 0 && (
        <div class="stats-block">
          <div class="stats-title">📊 Recent Performance</div>
          <div class="stats-block-content">
            {/* Recent Performance Dots */}
            <div class="recent-performance-section">
              <div class="recent-label">Last 20 attempts:</div>
              <div class="recent-attempts" role="img" aria-label="Recent performance dots">
                <For each={stats().history.slice(-20)}>
                  {(attempt) => (
                    <div 
                      class={`attempt-dot ${attempt.correct ? 'correct' : 'incorrect'}`}
                      title={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
                      role="img"
                      aria-label={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
                    ></div>
                  )}
                </For>
              </div>
            </div>

            {/* Recent Performance Metrics */}
            <div class="recent-metrics">
              <div class="metric-row">
                <div class="metric-item">
                  <div class="metric-value">{(() => {
                    const recent = stats().history.slice(-10)
                    return recent.length > 0 ? Math.round((recent.filter(h => h.correct).length / recent.length) * 100) : 0
                  })()}%</div>
                  <div class="metric-label">Last 10</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{(() => {
                    const recent = stats().history.slice(-5)
                    return recent.length > 0 ? Math.round((recent.filter(h => h.correct).length / recent.length) * 100) : 0
                  })()}%</div>
                  <div class="metric-label">Last 5</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{(() => {
                    let streak = 0
                    for (let i = stats().history.length - 1; i >= 0; i--) {
                      if (stats().history[i].correct) {
                        streak++
                      } else {
                        break
                      }
                    }
                    return streak
                  })()}</div>
                  <div class="metric-label">Current Streak</div>
                </div>
              </div>
            </div>

            {/* Recent Mode Breakdown */}
            <div class="recent-modes">
              <div class="recent-modes-title">Recent Modes Used:</div>
              <div class="recent-modes-list">
                {(() => {
                  const recentModes = stats().history.slice(-10).map(h => h.mode)
                  const modeCounts = recentModes.reduce((acc, mode) => {
                    acc[mode] = (acc[mode] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                  
                  return Object.entries(modeCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([mode, count]) => (
                      <div class="recent-mode-item">
                        <span class="recent-mode-name">{mode}</span>
                        <span class="recent-mode-count">{count}</span>
                      </div>
                    ))
                })()}
              </div>
            </div>

            {/* Performance Trend */}
            <div class="performance-trend">
              <div class="trend-label">Performance Trend:</div>
              <div class="trend-indicator">
                {(() => {
                  const last10 = stats().history.slice(-10)
                  const last20 = stats().history.slice(-20, -10)
                  
                  if (last10.length < 5 || last20.length < 5) return '📊 Not enough data'
                  
                  const recentAccuracy = last10.filter(h => h.correct).length / last10.length
                  const previousAccuracy = last20.filter(h => h.correct).length / last20.length
                  
                  if (recentAccuracy > previousAccuracy + 0.1) return '📈 Improving'
                  if (recentAccuracy < previousAccuracy - 0.1) return '📉 Declining'
                  return '➡️ Stable'
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 