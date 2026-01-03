import { type Component, Index } from 'solid-js'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { useCustomStacks } from '../../contexts/CustomStacksContext'
import { getStack, getStackTitle } from '../../constants/stacks'
import { getCardColorClass, getCardSuit, getCardValue } from '../../utils/cardHelpers'
import './StackView.css'

const StackView: Component = () => {
  const { stackType, cardInterval } = useAppSettings()
  const { customStacks } = useCustomStacks()
  const stack = () => getStack(stackType(), customStacks())
  const stackTitle = () => getStackTitle(stackType(), customStacks())
  const displayStack = () => stack().slice(cardInterval().start - 1, cardInterval().end)

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