import { type Component } from 'solid-js'
import './StackView.css'

interface StackViewProps {
  stack: string[]
  title: string
}

const StackView: Component<StackViewProps> = (props) => {
  function getCardColorClass(card: string): string {
    if (card.includes('♥') || card.includes('♦')) {
      return 'card-red'
    }
    return 'card-black'
  }

  return (
    <div class="stack-view">
      <div class="stack-header">
        <h2 class="stack-title">{props.title}</h2>
      </div>
      <ul class="stack-list">
        {props.stack.map((card, i) => (
          <li class="stack-item">
            <span class="stack-pos">{i + 1}</span>
            <span class={`stack-card ${getCardColorClass(card)}`}>{card}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StackView 