import { type JSX, type Component } from 'solid-js'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  children: JSX.Element;
  class?: string;
  ariaLabel?: string;
  tabindex?: number;
}

const Button: Component<ButtonProps> = (props) => {
  const variant = () => props.variant || 'primary'
  const size = () => props.size || 'medium'
  
  const handleClick = (e: MouseEvent) => {
    if (props.onClick && !props.disabled) {
      // Remove focus on touch devices to prevent stuck hover state
      const target = e.currentTarget as HTMLButtonElement
      if ('ontouchstart' in window) {
        target.blur()
      }
      props.onClick(e)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.onKeyDown) {
      props.onKeyDown(e)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (props.onClick && !props.disabled) {
        props.onClick(e as unknown as MouseEvent)
      }
    }
  }

  return (
    <button
      class={`btn btn-${variant()} btn-${size()} ${props.class || ''}`}
      type={props.type || 'button'}
      disabled={props.disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={props.ariaLabel}
      tabindex={props.tabindex ?? 0}
    >
      {props.children}
    </button>
  )
}

export default Button

