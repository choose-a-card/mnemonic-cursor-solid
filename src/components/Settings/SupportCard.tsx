import Card from '../shared/Card'
import './SupportCard.css'

export default function SupportCard() {
  return (
    <Card icon="☕" title="Support">
      <div class="support-info">
        <div class="support-text">
          If you find this app helpful for your card magic practice, consider supporting its development.
        </div>
        <a 
          href="https://buymeacoffee.com/yourusername" 
          target="_blank" 
          rel="noopener noreferrer"
          class="support-button"
        >
          ☕ Buy Me a Coffee
        </a>
        <div class="support-hint">
          Your support helps keep this app free and continuously improved.
        </div>
      </div>
    </Card>
  )
}

