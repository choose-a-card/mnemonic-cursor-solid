import Card from '../shared/Card'
import FormGroup from '../shared/FormGroup'
import DualRangeSlider from './DualRangeSlider'
import type { StackType } from '../../constants/stacks'
import type { CardInterval } from '../../types'
import './StackConfigCard.css'

interface StackConfigCardProps {
  stackType: StackType;
  cardInterval: CardInterval;
  onStackTypeChange: (type: StackType) => void;
  onCardIntervalChange: (interval: CardInterval) => void;
}

export default function StackConfigCard(props: StackConfigCardProps) {
  return (
    <Card icon="🎴" title="Stack Configuration" class="stack-config-card">
      <FormGroup label="Stack Type">
        <div class="stack-options">
          <button
            class={`stack-option ${props.stackType === 'tamariz' ? 'active' : ''}`}
            onClick={() => props.onStackTypeChange('tamariz' as StackType)}
          >
            <span class="option-name">Tamariz</span>
          </button>
          <button
            class={`stack-option ${props.stackType === 'aronson' ? 'active' : ''}`}
            onClick={() => props.onStackTypeChange('aronson' as StackType)}
          >
            <span class="option-name">Aronson</span>
          </button>
          <button
            class={`stack-option ${props.stackType === 'faro' ? 'active' : ''}`}
            onClick={() => props.onStackTypeChange('faro' as StackType)}
          >
            <span class="option-name">5th Faro</span>
          </button>
        </div>
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

