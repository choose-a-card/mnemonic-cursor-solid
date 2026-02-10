import { type Component, Show } from 'solid-js'
import { Transition } from 'solid-transition-group'
import './CardKeyboard.css'
import './NumericKeyboard.css'

interface NumericKeyboardProps {
  isVisible: boolean;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onToggleSign?: () => void;
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]

const NumericKeyboard: Component<NumericKeyboardProps> = (props) => {
  const handleDigitClick = (digit: string, event?: MouseEvent): void => {
    // Remove focus on touch devices to prevent stuck hover state
    if (event && 'ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    props.onDigit(digit)
  }

  const handleDeleteClick = (event?: MouseEvent): void => {
    if (event && 'ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    props.onDelete()
  }

  const handleSubmitClick = (event?: MouseEvent): void => {
    if (event && 'ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    props.onSubmit()
  }

  const handleToggleSignClick = (event?: MouseEvent): void => {
    if (event && 'ontouchstart' in window) {
      const target = event.currentTarget as HTMLButtonElement
      target.blur()
    }
    props.onToggleSign?.()
  }

  const handleKeyDown = (event: KeyboardEvent, action: () => void): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  return (
    <Transition name="keyboard-slide">
      {props.isVisible && (
        <div class="card-keyboard" role="dialog" aria-label="Numeric keyboard">
          <div class="keyboard-content">
            <div class="numeric-grid">
              {DIGIT_ROWS.map(row =>
                row.map(digit => (
                  <button
                    type="button"
                    class="rank-btn"
                    onClick={(event) => handleDigitClick(digit, event)}
                    onKeyDown={(event) => handleKeyDown(event, () => handleDigitClick(digit))}
                    aria-label={`Digit ${digit}`}
                    tabindex={0}
                  >
                    {digit}
                  </button>
                ))
              )}

              {/* Bottom row without sign: DEL, 0, OK */}
              <Show when={!props.onToggleSign}>
                <button
                  type="button"
                  class="rank-btn numeric-btn-action numeric-btn-delete"
                  onClick={(event) => handleDeleteClick(event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleDeleteClick())}
                  aria-label="Delete last digit"
                  tabindex={0}
                >
                  DEL
                </button>

                <button
                  type="button"
                  class="rank-btn"
                  onClick={(event) => handleDigitClick('0', event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleDigitClick('0'))}
                  aria-label="Digit 0"
                  tabindex={0}
                >
                  0
                </button>

                <button
                  type="button"
                  class="rank-btn numeric-btn-action numeric-btn-submit"
                  onClick={(event) => handleSubmitClick(event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleSubmitClick())}
                  aria-label="Submit answer"
                  tabindex={0}
                >
                  OK
                </button>
              </Show>

              {/* Bottom rows with sign: ±, 0, DEL then full-width OK */}
              <Show when={props.onToggleSign}>
                <button
                  type="button"
                  class="rank-btn numeric-btn-action numeric-btn-sign"
                  onClick={(event) => handleToggleSignClick(event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleToggleSignClick())}
                  aria-label="Toggle positive or negative"
                  tabindex={0}
                >
                  ±
                </button>

                <button
                  type="button"
                  class="rank-btn"
                  onClick={(event) => handleDigitClick('0', event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleDigitClick('0'))}
                  aria-label="Digit 0"
                  tabindex={0}
                >
                  0
                </button>

                <button
                  type="button"
                  class="rank-btn numeric-btn-action numeric-btn-delete"
                  onClick={(event) => handleDeleteClick(event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleDeleteClick())}
                  aria-label="Delete last digit"
                  tabindex={0}
                >
                  DEL
                </button>

                <button
                  type="button"
                  class="numeric-btn-ok-wide numeric-btn-action numeric-btn-submit"
                  onClick={(event) => handleSubmitClick(event)}
                  onKeyDown={(event) => handleKeyDown(event, () => handleSubmitClick())}
                  aria-label="Submit answer"
                  tabindex={0}
                >
                  OK
                </button>
              </Show>
            </div>
          </div>
        </div>
      )}
    </Transition>
  )
}

export default NumericKeyboard
