import Card from '../shared/Card'
import './AboutCard.css'

export default function AboutCard() {
  return (
    <Card icon="ℹ️" title="About">
      <div class="about-info">
        <div class="app-name">Mnemonic Stack Trainer</div>
        <div class="app-version">Version 1.0.0</div>
        <div class="app-description">
          Master the Tamariz, Aronson, and 5th Faro card stacks with multiple training modes and detailed analytics.
        </div>
      </div>
    </Card>
  )
}

