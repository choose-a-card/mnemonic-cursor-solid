import { type Component } from 'solid-js'
import './Toggle.css'

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const Toggle: Component<ToggleProps> = (props) => {
  const handleClick = () => {
    if (!props.disabled) {
      props.onChange(!props.checked)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.ariaLabel}
      class={`toggle ${props.checked ? 'toggle-active' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={props.disabled}
      tabindex={0}
    >
      <div class="toggle-slider"></div>
    </button>
  )
}

export default Toggle

