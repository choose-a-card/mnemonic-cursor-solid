import Card from '../shared/Card'
import './SupportCard.css'

export default function SupportCard() {
  const handleSupportClick = () => {
    window.open('https://buymeacoffee.com/jcvaleravl', '_blank', 'noopener,noreferrer')
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSupportClick()
    }
  }

  return (
    <Card icon="☕" title="Support">
      <div class="support-info">
        <div class="support-text">
          If you enjoy using this app, consider supporting its development with a coffee!
        </div>
        <a
          href="https://buymeacoffee.com/jcvaleravl"
          target="_blank"
          rel="noopener noreferrer"
          class="support-button"
          tabindex="0"
          onClick={handleSupportClick}
          onKeyDown={handleKeyDown}
          aria-label="Support the developer on Buy Me a Coffee"
        >
          ☕ Buy Me a Coffee
        </a>
        <div class="support-hint">
          Your support helps keep this app free and continuously improving
        </div>
      </div>
    </Card>
  )
}

