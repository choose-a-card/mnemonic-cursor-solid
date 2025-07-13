import { createEffect, createSignal, type Component, batch } from 'solid-js'
import { Transition } from 'solid-transition-group'
import { RANKS, SUITS } from '../../constants/cards'
import { isValidCard } from '../../utils/utils';

interface CardKeyboardProps {
  isVisible: boolean;
  onClose: () => void;
  onCardSelect: (card: string) => void;
  onPartialSelect?: (partial: string) => void; // New callback for partial selections
}

const CardKeyboard: Component<CardKeyboardProps> = (props) => {
  const [selectedRank, setSelectedRank] = createSignal<string>('')
  const [selectedSuit, setSelectedSuit] = createSignal<string>('')

  // Effect for partial selection updates
  createEffect(() => {
    const rank = selectedRank()
    const suit = selectedSuit()
    const partial = rank + suit
    
    // Update partial selection for any non-empty partial (including complete cards)
    // Only skip when both are empty (reset)
    if (props.onPartialSelect && partial) {
      props.onPartialSelect(partial)
    }
  })

  // Effect for complete card submission
  createEffect(() => {
    const rank = selectedRank()
    const suit = selectedSuit()
    
    // Only proceed if both rank and suit are selected
    if (rank && suit) {
      const card = rank + suit
      
      // Only submit if it's a valid card
      if (isValidCard(card)) {
        // Small delay to show the selection before submitting
          props.onCardSelect(card)
          // Reset selections atomically to prevent partial updates
          batch(() => {
            setSelectedRank('')
            setSelectedSuit('')
          })
      }
    }
  })

  function handleClose(): void {
    // Reset selection atomically when closing
    batch(() => {
      setSelectedRank('')
      setSelectedSuit('')
    })
    props.onClose()
  }

  return (
    <Transition name="keyboard-slide">
      {props.isVisible && (
        <div class="card-keyboard">
          <div class="keyboard-header">
            <button 
              type="button" 
              class="keyboard-close"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
          
          <div class="keyboard-content">
            <div class="rank-selection">
              <div class="rank-grid">
                {RANKS.map(r => (
                  <button 
                    type="button" 
                    class={`rank-btn ${selectedRank() === r ? 'selected' : ''}`}
                    onClick={() => setSelectedRank(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div class="suit-selection">
              <div class="suit-grid">
                {SUITS.map(s => (
                  <button 
                    type="button" 
                    class={`suit-btn ${s.name} ${selectedSuit() === s.symbol ? 'selected' : ''}`}
                    onClick={() => setSelectedSuit(s.symbol)}
                  >
                    {s.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Transition>
  )
}

export default CardKeyboard 