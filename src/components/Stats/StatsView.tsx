import './StatsView.css'

function topN(obj, n, labeler) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ label: labeler(k), count: v }))
}

function getAISuggestions(stats, stack) {
  const suggestions = []
  const { history, cardFails, posFails, total, correct } = stats
  
  if (total === 0) return ['Start practicing to get personalized suggestions!']
  
  const accuracy = (correct / total) * 100
  
  // Overall accuracy suggestions
  if (accuracy < 50) {
    suggestions.push('Focus on memorizing the first 20 cards of the stack.')
  } else if (accuracy < 70) {
    suggestions.push('You\'re improving! Try practicing in smaller chunks.')
  } else if (accuracy < 85) {
    suggestions.push('Great progress! Focus on your most missed cards.')
  } else {
    suggestions.push('Excellent accuracy! Try advanced modes like One Ahead.')
  }
  
  // Position-based suggestions
  const positionFailures = Object.entries(posFails)
  if (positionFailures.length > 0) {
    const highestFailPos = positionFailures.reduce((a, b) => a[1] > b[1] ? a : b)
    const pos = Number(highestFailPos[0])
    
    if (pos > 39) {
      suggestions.push('You struggle with the last quarter of the stack.')
    } else if (pos > 26) {
      suggestions.push('Focus on positions 27-39, your weak spot.')
    } else if (pos > 13) {
      suggestions.push('Practice the middle section more (positions 14-26).')
    }
  }
  
  return suggestions.slice(0, 3) // Limit to 3 suggestions
}

function createAccuracyChart(history) {
  if (history.length < 2) return null
  
  // Group by sessions (every 10 attempts)
  const sessions = []
  for (let i = 0; i < history.length; i += 10) {
    const session = history.slice(i, i + 10)
    const accuracy = (session.filter(h => h.correct).length / session.length) * 100
    sessions.push({ session: Math.floor(i / 10) + 1, accuracy })
  }
  
  return sessions
}

export default function StatsView(props) {
  const { stats, stack } = props
  const topCards = topN(stats.cardFails, 5, c => c)
  const topPos = topN(stats.posFails, 5, p => `${p} (${stack[Number(p)-1] || ''})`)
  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 100
  const suggestions = getAISuggestions(stats, stack)
  const chartData = createAccuracyChart(stats.history)

  return (
    <div class="stats-view">
      <div class="stats-overview">
        <div class="accuracy-circle">
          <div class="accuracy-value">{accuracy}%</div>
          <div class="accuracy-label">Overall Accuracy</div>
        </div>
        <div class="quick-stats">
          <div class="quick-stat">
            <div class="stat-value">{stats.total}</div>
            <div class="stat-label">Total Attempts</div>
          </div>
          <div class="quick-stat">
            <div class="stat-value">{stats.correct}</div>
            <div class="stat-label">Correct</div>
          </div>
        </div>
      </div>

      {chartData && chartData.length > 1 && (
        <div class="stats-block">
          <div class="stats-title">📈 Accuracy Trend</div>
          <div class="accuracy-chart">
            {chartData.map((session, i) => (
              <div class="chart-bar" key={i}>
                <div 
                  class="bar-fill" 
                  style={{ height: `${session.accuracy}%` }}
                  title={`Session ${session.session}: ${session.accuracy.toFixed(1)}%`}
                ></div>
                <div class="bar-label">{session.session}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div class="stats-block">
        <div class="stats-title">🤖 AI Suggestions</div>
        <ul class="suggestions-list">
          {suggestions.map((suggestion, i) => (
            <li class="suggestion-item" key={i}>{suggestion}</li>
          ))}
        </ul>
      </div>

      <div class="stats-block">
        <div class="stats-title">🎯 Most Missed Cards</div>
        <ul class="stats-list">
          {topCards.length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
          {topCards.map((item, i) => (
            <li class="stats-item" key={i}>
              <span class="card-display">{item.label}</span>
              <span class="stats-count">×{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div class="stats-block">
        <div class="stats-title">📍 Most Missed Positions</div>
        <ul class="stats-list">
          {topPos.length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
          {topPos.map((item, i) => (
            <li class="stats-item" key={i}>
              <span class="position-display">{item.label}</span>
              <span class="stats-count">×{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {stats.history.length > 0 && (
        <div class="stats-block">
          <div class="stats-title">📊 Recent Performance</div>
          <div class="recent-attempts">
            {stats.history.slice(-10).map((attempt, i) => (
              <div 
                class={`attempt-dot ${attempt.correct ? 'correct' : 'incorrect'}`}
                key={i}
                title={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
              ></div>
            ))}
          </div>
          <div class="recent-label">Last 10 attempts</div>
        </div>
      )}
    </div>
  )
} 