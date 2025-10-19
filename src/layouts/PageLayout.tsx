import { type Component, type JSX, Show } from 'solid-js'
import './PageLayout.css'

interface PageLayoutProps {
  title?: string;
  icon?: string;
  header?: JSX.Element;
  children: JSX.Element;
  class?: string;
}

const PageLayout: Component<PageLayoutProps> = (props) => {
  return (
    <div class={`page-layout ${props.class || ''}`}>
      <Show when={props.header}>
        {props.header}
      </Show>
      <Show when={!props.header && (props.title || props.icon)}>
        <div class="page-header">
          <Show when={props.icon}>
            <span class="page-icon" aria-hidden="true">{props.icon}</span>
          </Show>
          <Show when={props.title}>
            <h2 class="page-title">{props.title}</h2>
          </Show>
        </div>
      </Show>
      <div class="page-content">
        {props.children}
      </div>
    </div>
  )
}

export default PageLayout

