import { For, Show } from 'solid-js'
import Card from '../shared/Card'
import FormGroup from '../shared/FormGroup'
import DualRangeSlider from './DualRangeSlider'
import { useCustomStacks } from '../../contexts/CustomStacksContext'
import { createCustomStackType, isCustomStackType, getCustomStackId } from '../../constants/stacks'
import type { StackType, PresetStackType } from '../../constants/stacks'
import type { CardInterval } from '../../types'
import './StackConfigCard.css'

interface StackConfigCardProps {
  stackType: StackType;
  cardInterval: CardInterval;
  onStackTypeChange: (type: StackType) => void;
  onCardIntervalChange: (interval: CardInterval) => void;
  /** Called when user commits the range (releases slider). Optional, for analytics. */
  onCardIntervalCommit?: (interval: CardInterval) => void;
}

const PRESET_OPTIONS: { type: PresetStackType; label: string }[] = [
  { type: 'tamariz', label: 'Tamariz' },
  { type: 'aronson', label: 'Aronson' },
  { type: 'faro', label: '5th Faro' },
]

export default function StackConfigCard(props: StackConfigCardProps) {
  const { customStacks } = useCustomStacks()

  const handleStackChange = (type: StackType, event: MouseEvent) => {
    // Remove focus on touch devices to prevent stuck hover state
    if ('ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    props.onStackTypeChange(type)
  }

  const isPresetActive = (type: PresetStackType): boolean => {
    return props.stackType === type
  }

  const isCustomActive = (stackId: string): boolean => {
    if (!isCustomStackType(props.stackType)) return false
    return getCustomStackId(props.stackType) === stackId
  }

  return (
    <Card icon="🎴" title="Stack Configuration" class="stack-config-card">
      <FormGroup label="Stack Type">
        <div class="stack-options">
          <For each={PRESET_OPTIONS}>
            {(option) => (
              <button
                class={`stack-option ${isPresetActive(option.type) ? 'active' : ''}`}
                onClick={(e) => handleStackChange(option.type, e)}
                aria-label={`Select ${option.label} stack`}
                tabindex="0"
              >
                <span class="option-name">{option.label}</span>
              </button>
            )}
          </For>
        </div>

        <Show when={customStacks().length > 0}>
          <div class="custom-stacks-divider">
            <span>Custom Stacks</span>
          </div>
          <div class="stack-options custom-stack-options">
            <For each={customStacks()}>
              {(stack) => (
                <button
                  class={`stack-option custom ${isCustomActive(stack.id) ? 'active' : ''}`}
                  onClick={(e) => handleStackChange(createCustomStackType(stack.id), e)}
                  aria-label={`Select ${stack.name} custom stack`}
                  tabindex="0"
                >
                  <span class="option-name">{stack.name}</span>
                </button>
              )}
            </For>
          </div>
        </Show>
      </FormGroup>

      <FormGroup label="Practice Range">
        <div class="range-container">
          <DualRangeSlider
            min={1}
            max={52}
            start={props.cardInterval.start}
            end={props.cardInterval.end}
            onRangeChange={(start, end) => {
              props.onCardIntervalChange({ start, end })
            }}
            onRangeCommit={
              props.onCardIntervalCommit
                ? (start, end) => props.onCardIntervalCommit!({ start, end })
                : undefined
            }
            step={1}
          />
          <div class="range-info">
            <span class="range-text">Cards {props.cardInterval.start} - {props.cardInterval.end}</span>
            <span class="range-count">({props.cardInterval.end - props.cardInterval.start + 1} cards)</span>
          </div>
        </div>
      </FormGroup>
    </Card>
  )
}
