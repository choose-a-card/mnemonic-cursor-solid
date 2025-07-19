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

  function getCardSuit(card: string): string {
    if (card.includes('♠')) return '♠'
    if (card.includes('♥')) return '♥'
    if (card.includes('♦')) return '♦'
    if (card.includes('♣')) return '♣'
    return ''
  }

  function getCardValue(card: string): string {
    return card.replace(/[♠♥♦♣]/g, '').trim()
  }

  return (
    <div class="stack-view">
      <div class="stack-header">
        <h2 class="stack-title">{stackTitle()}</h2>
      </div>
      <div class="stack-grid">
        <Index each={displayStack()}>
          {(card, i) => (
            <div class="stack-card-item">
              <div class={`playing-card ${getCardColorClass(card())}`}>
                <div class="card-value">{getCardValue(card())}</div>
                <div class="card-suit">{getCardSuit(card())}</div>
                <div class="card-index">{cardInterval().start + i}</div>
              </div>
            </div>
          )}
        </Index>
      </div>
    </div>
  )
}

export default StackView 