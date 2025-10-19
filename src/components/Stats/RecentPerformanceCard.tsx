import { For } from 'solid-js'
import Card from '../shared/Card'
import { calculateRecentAccuracy, calculateCurrentStreak, calculateTrend } from '../../utils/statsCalculations'
import type { Stats } from '../../types'
import './RecentPerformanceCard.css'

interface RecentPerformanceCardProps {
  stats: Stats;
}

export default function RecentPerformanceCard(props: RecentPerformanceCardProps) {
  const last10Accuracy = () => calculateRecentAccuracy(props.stats.history, 10)
  const currentStreak = () => calculateCurrentStreak(props.stats.history)
  const trend = () => calculateTrend(props.stats.history)

  return (
    <Card class="recent-performance-card">
      <div class="card-header">
        <h3 class="card-title">Recent Performance</h3>
      </div>
      <div class="card-content">
        {/* Performance Metrics */}
        <div class="performance-metrics">
          <div class="metric">
            <div class="metric-value">{last10Accuracy()}%</div>
            <div class="metric-label">Last 10</div>
          </div>
          <div class="metric">
            <div class="metric-value">{currentStreak()}</div>
            <div class="metric-label">Current Streak</div>
          </div>
          <div class="metric">
            <div class="metric-value">{trend()}</div>
            <div class="metric-label">Trend</div>
          </div>
        </div>

        {/* Recent Attempts Visualization */}
        <div class="recent-attempts-section">
          <div class="attempts-label">Last 20 attempts</div>
          <div class="attempts-dots">
            <For each={props.stats.history.slice(-20)}>
              {(attempt) => (
                <div 
                  class={`attempt-dot ${attempt.correct ? 'correct' : 'incorrect'}`}
                  title={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
                ></div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Card>
  )
}

