import Card from '../shared/Card'
import './AboutCard.css'

export default function AboutCard() {
  // Build-time constant injected by Vite (defined in vite-env.d.ts)
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null
  
  const formatBuildTime = (isoString: string | null): string => {
    if (!isoString) return 'Development'
    try {
      const date = new Date(isoString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    } catch {
      return isoString
    }
  }

  return (
    <Card icon="ℹ️" title="About">
      <div class="about-info">
        <div class="app-name">Mnemonic Stack Trainer</div>
        {buildTime && buildTime !== 'null' && (
          <div class="build-time">
            Deployed: {formatBuildTime(buildTime)}
          </div>
        )}
        <div class="app-description">
          Master the Tamariz, Aronson, and 5th Faro card stacks with multiple training modes and detailed analytics.
        </div>
      </div>
    </Card>
  )
}

