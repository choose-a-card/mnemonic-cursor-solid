import { For, Show, createMemo } from 'solid-js'
import Card from '../shared/Card'
import type { Stats } from '../../types'
import './ModePerformanceCard.css'

interface ModePerformanceCardProps {
  stats: Stats;
}

export default function ModePerformanceCard(props: ModePerformanceCardProps) {
  // Sort modes by total attempts (most practiced first)
  const sortedModes = createMemo(() => {
    return Object.entries(props.stats.modeStats)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([mode, stats]) => ({ mode, ...stats }))
  })

  const hasAnyModeData = createMemo(() => sortedModes().length > 0)

  return (
    <Show when={hasAnyModeData()}>
      <Card icon="🎯" title="Mode Performance" class="mode-performance-card">
        <div class="mode-list">
          <For each={sortedModes()}>
            {(modeData) => (
              <div class="mode-row">
                <div class="mode-info">
                  <span class="mode-name">{modeData.mode}</span>
                  <span class="mode-attempts">{modeData.total} attempts</span>
                </div>
                <div class="mode-accuracy-container">
                  <div 
                    class="mode-accuracy-bar" 
                    style={{ width: `${modeData.accuracy}%` }}
                    classList={{
                      'high': modeData.accuracy >= 80,
                      'medium': modeData.accuracy >= 60 && modeData.accuracy < 80,
                      'low': modeData.accuracy < 60
                    }}
                  ></div>
                  <span class="mode-accuracy-text">{modeData.accuracy}%</span>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>
    </Show>
  )
}

