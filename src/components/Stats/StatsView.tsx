import { createMemo } from 'solid-js'
import './StatsView.css'
import { useStats } from '../../contexts/StatsContext'
import type { Stats } from '../../types'
import BadgeDisplay from './BadgeDisplay'
import { isFeatureEnabled } from '../../utils/featureFlags'

const topN = (obj: Record<string, number>, n: number, labeler: (key: string) => string) => {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ label: labeler(k), count: v }))
}

const getAISuggestions = (stats: Stats) => {
  const suggestions = []
  const { history, cardFails, posFails, total, correct, modeStats } = stats
  
  if (total === 0) return ['Start practicing to get personalized suggestions!']
  
  const accuracy = (correct / total) * 100
  
  // Overall accuracy suggestions
  if (accuracy < 40) {
    suggestions.push('🎯 **Beginner Focus**: Start with Card → Position mode for positions 1-10. Build a solid foundation before advancing.')
  } else if (accuracy < 60) {
    suggestions.push('📈 **Building Momentum**: Practice positions 1-20 in smaller chunks. Try Position → Card mode to strengthen recall.')
  } else if (accuracy < 75) {
    suggestions.push('🚀 **Good Progress**: Challenge yourself with One Ahead mode. Your foundation is solid - time to build connections.')
  } else if (accuracy < 85) {
    suggestions.push('⭐ **Advanced Level**: Focus on your weakest areas. Try Stack Context mode to test your comprehensive knowledge.')
  } else if (accuracy < 95) {
    suggestions.push('🏆 **Expert Level**: Challenge yourself with Cutting Estimation and Quartet Position modes. You\'re mastering the stack!')
  } else {
    suggestions.push('👑 **Master Level**: Consider switching to a different stack or practicing with the full 52-card range. You\'ve mastered this one!')
  }
  
  // Mode-specific analysis and recommendations
  const modeEntries = Object.entries(modeStats)
  if (modeEntries.length > 0) {
    // Find the mode with lowest accuracy
    const worstMode = modeEntries.reduce((a, b) => a[1].accuracy < b[1].accuracy ? a : b)
    const bestMode = modeEntries.reduce((a, b) => a[1].accuracy > b[1].accuracy ? a : b)
    
    // Suggest improvements for worst performing mode
    if (worstMode[1].total >= 5) { // Only suggest if they've tried it enough
      const mode = worstMode[0]
      const modeAccuracy = worstMode[1].accuracy
      
      if (mode === 'Card → Position' && modeAccuracy < 70) {
        suggestions.push(`🎴 **Card → Position** (${modeAccuracy}%): Focus on memorizing card names first. Practice with positions 1-10 repeatedly.`)
      } else if (mode === 'Position → Card' && modeAccuracy < 70) {
        suggestions.push(`📍 **Position → Card** (${modeAccuracy}%): Visualize the stack layout. Practice with familiar positions first.`)
      } else if (mode === 'One Ahead' && modeAccuracy < 60) {
        suggestions.push(`⏭️ **One Ahead** (${modeAccuracy}%): This is advanced! Master Card → Position first, then practice with small ranges.`)
      } else if (mode === 'Stack Context' && modeAccuracy < 65) {
        suggestions.push(`🔗 **Stack Context** (${modeAccuracy}%): Build card-to-card connections. Practice adjacent cards together.`)
      } else if (mode === 'Cutting Estimation' && modeAccuracy < 50) {
        suggestions.push(`✂️ **Cutting Estimation** (${modeAccuracy}%): This tests deep knowledge. Focus on mastering basic modes first.`)
      } else if (mode === 'First or Second Half' && modeAccuracy < 70) {
        suggestions.push(`📊 **First or Second Half** (${modeAccuracy}%): Practice dividing the stack mentally. Focus on positions 1-26 vs 27-52.`)
      } else if (mode === 'Quartet Position' && modeAccuracy < 60) {
        suggestions.push(`🎭 **Quartet Position** (${modeAccuracy}%): Advanced mode! Master individual positions before grouping.`)
      } else if (mode === 'Cut to Position' && modeAccuracy < 55) {
        suggestions.push(`🎯 **Cut to Position** (${modeAccuracy}%): Most advanced mode! Requires complete stack mastery. Practice basics first.`)
      }
    }
    
    // Celebrate best performing mode
    if (bestMode[1].accuracy >= 85 && bestMode[1].total >= 10) {
      suggestions.push(`🌟 **Strengths**: You excel at ${bestMode[0]} (${bestMode[1].accuracy}%). Use this confidence to tackle harder modes!`)
    }
  }
  
  // Position-based suggestions
  const positionFailures = Object.entries(posFails)
  if (positionFailures.length > 0) {
    const highestFailPos = positionFailures.reduce((a, b) => a[1] > b[1] ? a : b)
    const pos = Number(highestFailPos[0])
    const failCount = highestFailPos[1]
    
    if (failCount >= 3) {
      if (pos <= 10) {
        suggestions.push(`🔢 **Foundation Issue**: Position ${pos} (${failCount} failures) - Critical for all modes. Practice this position daily.`)
      } else if (pos <= 20) {
        suggestions.push(`📚 **Core Section**: Position ${pos} (${failCount} failures) - Essential for most tricks. Focus on this range.`)
      } else if (pos <= 30) {
        suggestions.push(`🎪 **Middle Section**: Position ${pos} (${failCount} failures) - Important for advanced moves. Practice with context.`)
      } else if (pos <= 40) {
        suggestions.push(`🎯 **Upper Section**: Position ${pos} (${failCount} failures) - Less common but valuable. Review occasionally.`)
      } else {
        suggestions.push(`🏁 **End Section**: Position ${pos} (${failCount} failures) - Rare but impressive. Practice when confident.`)
      }
    }
  }
  
  // Card-specific suggestions
  const cardFailures = Object.entries(cardFails)
  if (cardFailures.length > 0) {
    const topFailedCard = cardFailures.reduce((a, b) => a[1] > b[1] ? a : b)
    const card = topFailedCard[0]
    const failCount = topFailedCard[1]
    
    if (failCount >= 3) {
      suggestions.push(`🃏 **Problem Card**: ${card} (${failCount} failures) - Create a memorable association for this card.`)
    }
  }
  
  // Practice frequency and consistency
  if (total < 20) {
    suggestions.push('⏰ **Practice More**: Aim for at least 50 attempts to see meaningful patterns. Daily practice builds consistency.')
  } else if (total < 100) {
    suggestions.push('📅 **Good Frequency**: Try to practice daily for 10-15 minutes. Consistency beats intensity.')
  } else if (total < 500) {
    suggestions.push('💪 **Dedicated Practice**: Excellent commitment! Focus on quality over quantity now.')
  }
  
  // Recent performance trends
  const recentHistory = history.slice(-10)
  if (recentHistory.length >= 5) {
    const recentAccuracy = recentHistory.filter(h => h.correct).length / recentHistory.length * 100
    const overallAccuracy = accuracy
    
    if (recentAccuracy > overallAccuracy + 15) {
      suggestions.push('📈 **Improving Fast**: Your recent performance is significantly better! You\'re on the right track.')
    } else if (recentAccuracy > overallAccuracy + 5) {
      suggestions.push('👍 **Steady Progress**: Your recent performance shows improvement. Keep up the good work!')
    } else if (recentAccuracy < overallAccuracy - 10) {
      suggestions.push('⚠️ **Recent Dip**: Your recent performance has declined. Consider reviewing fundamentals or taking a short break.')
    }
  }
  
  // Mode variety suggestions
  const uniqueModes = new Set(history.map(h => h.mode)).size
  if (uniqueModes < 3 && total > 50) {
    suggestions.push('🔄 **Try New Modes**: You\'ve mostly practiced ${uniqueModes} mode(s). Variety builds comprehensive skills.')
  } else if (uniqueModes >= 5) {
    suggestions.push('🎯 **Well Rounded**: Great variety in practice modes! Focus on improving your weakest areas now.')
  }
  
  // Specific mode recommendations based on current level
  if (accuracy < 50) {
    suggestions.push('🎯 **Recommended Next**: Start with Card → Position mode, positions 1-10 only. Master the basics first.')
  } else if (accuracy < 70) {
    suggestions.push('🎯 **Recommended Next**: Try Position → Card mode to strengthen your position recall skills.')
  } else if (accuracy < 80) {
    suggestions.push('🎯 **Recommended Next**: Challenge yourself with One Ahead mode to build card-to-card connections.')
  } else if (accuracy < 90) {
    suggestions.push('🎯 **Recommended Next**: Test your knowledge with Stack Context and Cutting Estimation modes.')
  } else {
    suggestions.push('🎯 **Recommended Next**: Master the advanced modes - Quartet Position and Cut to Position.')
  }
  
  return suggestions.slice(0, 4) // Limit to 4 suggestions for better readability
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

interface StatsViewProps {
  stack: string[];
  onGenerateDebugStats?: (() => void) | undefined;
}

export default function StatsView(props: StatsViewProps) {
  const { stats, badges, lastUnlockedBadge } = useStats()
  
  console.log('StatsView rendered with stats:', stats())
  console.log('StatsView props.onGenerateDebugStats:', props.onGenerateDebugStats)
  
  const topCards = createMemo(() => topN(stats().cardFails, 5, c => c))
  const topPos = createMemo(() => topN(stats().posFails, 5, p => `${p} (${props.stack[Number(p)-1] || ''})`))
  const accuracy = createMemo(() => stats().total ? Math.round((stats().correct / stats().total) * 100) : 100)

  const suggestions = createMemo(() => getAISuggestions(stats()))
  const chartData = createMemo(() => createAccuracyChart(stats().history))



  const handleDebugClick = () => {
    console.log('Debug button clicked, onGenerateDebugStats:', props.onGenerateDebugStats)
    if (props.onGenerateDebugStats) {
      console.log('Calling onGenerateDebugStats')
      props.onGenerateDebugStats()
    } else {
      console.log('onGenerateDebugStats is undefined')
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
      {props.onGenerateDebugStats && (
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
          <div class="chart-explanation">
            Shows your accuracy over practice sessions (10 attempts each). Higher bars = better performance.
          </div>
          <div class="accuracy-chart" role="img" aria-label="Accuracy trend chart">
            {(chartData() || []).map((session, _i) => {
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
            })}
          </div>
          <div class="chart-footer">
            Latest {(chartData() || []).length} sessions • Each bar = 10 attempts
          </div>
        </div>
      )}

      <div class="stats-block">
        <div class="stats-title">🤖 AI Suggestions</div>
        <ul class="suggestions-list" role="list" aria-label="AI-powered practice suggestions">
          {(suggestions() || []).map((suggestion, _i) => (
            <li class="suggestion-item" role="listitem">{suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Badges Section - only show if badges are enabled */}
      {isFeatureEnabled('badgesEnabled') && (
        <div class="stats-block">
          <div class="stats-title">🏆 Achievements</div>
          <BadgeDisplay 
            badges={badges()} 
            lastUnlockedBadge={lastUnlockedBadge()} 
          />
        </div>
      )}

      <div class="stats-block">
        <div class="stats-title">🎯 Most Missed Cards</div>
        <ul class="stats-list" role="list" aria-label="Most frequently missed cards">
          {topCards().length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
          {topCards().map((item, _i) => (
            <li class="stats-item" role="listitem">
              <span class="card-display">{item.label}</span>
              <span class="stats-count">×{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div class="stats-block">
        <div class="stats-title">📍 Most Missed Positions</div>
        <ul class="stats-list" role="list" aria-label="Most frequently missed positions">
          {topPos().length === 0 && <li class="stats-empty">None yet - keep practicing!</li>}
          {topPos().map((item, _i) => (
            <li class="stats-item" role="listitem">
              <span class="position-display">{item.label}</span>
              <span class="stats-count">×{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {stats().history.length > 0 && (
        <div class="stats-block">
          <div class="stats-title">📊 Recent Performance</div>
          <div class="recent-attempts" role="img" aria-label="Recent performance dots">
            {stats().history.slice(-20).map((attempt, _i) => (
              <div 
                class={`attempt-dot ${attempt.correct ? 'correct' : 'incorrect'}`}
                title={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
                role="img"
                aria-label={`${attempt.mode}: ${attempt.correct ? 'Correct' : 'Incorrect'}`}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 