import { type JSX, type Component, Show } from 'solid-js'
import './FormGroup.css'

interface FormGroupProps {
  label: string;
  description?: string;
  children: JSX.Element;
  class?: string;
  horizontal?: boolean;
}

const FormGroup: Component<FormGroupProps> = (props) => {
  return (
    <div class={`form-group ${props.horizontal ? 'form-group-horizontal' : ''} ${props.class || ''}`}>
      <div class="form-group-info">
        <label class="form-group-label">{props.label}</label>
        <Show when={props.description}>
          <span class="form-group-description">{props.description}</span>
        </Show>
      </div>
      <div class="form-group-control">
        {props.children}
      </div>
    </div>
  )
}

export default FormGroup

