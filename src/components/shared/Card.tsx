import { type JSX, type Component, Show } from 'solid-js'
import './Card.css'

interface CardProps {
  children: JSX.Element;
  class?: string;
  header?: JSX.Element;
  title?: string;
  icon?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: Component<CardProps> = (props) => {
  const hasHeader = () => props.header || props.title || props.icon

  return (
    <div 
      class={`card ${props.hoverable ? 'card-hoverable' : ''} ${props.class || ''}`}
      onClick={props.onClick}
    >
      <Show when={hasHeader()}>
        <div class="card-header">
          <Show when={props.header}>
            {props.header}
          </Show>
          <Show when={!props.header && (props.icon || props.title)}>
            <Show when={props.icon}>
              <div class="card-icon" aria-hidden="true">{props.icon}</div>
            </Show>
            <Show when={props.title}>
              <h3 class="card-title">{props.title}</h3>
            </Show>
          </Show>
        </div>
      </Show>
      <div class="card-content">
        {props.children}
      </div>
    </div>
  )
}

export default Card

