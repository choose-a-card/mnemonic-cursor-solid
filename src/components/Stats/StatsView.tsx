import { Show } from 'solid-js'
import './StatsView.css'
import { useStats } from '../../contexts/StatsContext'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import OverallAccuracyCard from './OverallAccuracyCard'
import RecentPerformanceCard from './RecentPerformanceCard'
import ModePerformanceCard from './ModePerformanceCard'
import DebugControls from './DebugControls'

export default function StatsView() {
  const { stats, generateDebugStats } = useStats()
  const { debugMode } = useAppSettings()

  return (
    <div class="stats-view">
      {/* Main Stats Grid */}
      <div class="stats-grid">
        {/* Overall Accuracy Card */}
        <OverallAccuracyCard stats={stats()} />

        {/* Recent Performance Card */}
        <Show when={stats().history.length > 0}>
          <RecentPerformanceCard stats={stats()} />
        </Show>

        {/* Mode Performance Card - Shows breakdown by practice mode */}
        <ModePerformanceCard stats={stats()} />
      </div>

      {/* Debug Button - only show if debug mode enabled */}
      <DebugControls 
        debugMode={debugMode} 
        onGenerateDebugStats={generateDebugStats}
      />
    </div>
  )
}
