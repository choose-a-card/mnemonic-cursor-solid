import { type Component } from 'solid-js'
import './Input.css'

export type InputType = 'text' | 'number' | 'email' | 'password'

interface InputProps {
  type?: InputType;
  value: string | number;
  onInput: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autofocus?: boolean;
  readonly?: boolean;
  class?: string;
  ariaLabel?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Input: Component<InputProps> = (props) => {
  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    props.onInput(target.value)
  }

  return (
    <input
      class={`input ${props.class || ''}`}
      type={props.type || 'text'}
      value={props.value}
      onInput={handleInput}
      placeholder={props.placeholder}
      disabled={props.disabled}
      required={props.required}
      autofocus={props.autofocus}
      readonly={props.readonly}
      aria-label={props.ariaLabel}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  )
}

export default Input

