import { type Component, Index } from 'solid-js'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { getStack, getStackTitle } from '../../constants/stacks'
import './StackView.css'

const StackView: Component = () => {
  const { stackType, cardInterval } = useAppSettings()
  const stack = () => getStack(stackType())
  const stackTitle = () => getStackTitle(stackType())
  const displayStack = () => stack().slice(cardInterval().start - 1, cardInterval().end)

  function getCardColorClass(card: string): string {
    if (card.includes('♥') || card.includes('♦')) {
      return 'card-red'
    }
    return 'card-black'
  }

  return (
    <div class="stack-view">
      <div class="stack-header">
        <h2 class="stack-title">{stackTitle()}</h2>
      </div>
      <ul class="stack-list">
        <Index each={displayStack()}>
          {(card, i) => (
            <li class="stack-item">
              <span class="stack-pos">{cardInterval().start + i}</span>
              <span class={`stack-card ${getCardColorClass(card())}`}>{card()}</span>
            </li>
          )}
        </Index>
      </ul>
    </div>
  )
}

export default StackView 