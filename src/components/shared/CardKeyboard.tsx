import { createEffect, createSignal, type Component, batch, onMount, onCleanup } from 'solid-js'
import { Transition } from 'solid-transition-group'
import { RANKS, SUITS } from '../../constants/cards'
import { isValidCard } from '../../utils/utils'
import './CardKeyboard.css'

interface CardKeyboardProps {
  isVisible: boolean;
  onClose: () => void;
  onCardSelect: (card: string) => void;
  onPartialSelect?: (partial: string) => void; // New callback for partial selections
}

const CardKeyboard: Component<CardKeyboardProps> = (props) => {
  const [selectedRank, setSelectedRank] = createSignal<string>('')
  const [selectedSuit, setSelectedSuit] = createSignal<string>('')
  let keyboardRef: HTMLDivElement | undefined

  // Group ranks into three rows: A-4, 5-10, J-K
  const rankRows = [
    RANKS.slice(0, 5),  // A, 2, 3, 4, 5
    RANKS.slice(5, 10), // 6, 7, 8, 9, 10
    RANKS.slice(10)     // J, Q, K, A
  ]

  // Click outside handler
  const handleClickOutside = (event: MouseEvent) => {
    if (keyboardRef && !keyboardRef.contains(event.target as Node)) {
      handleClose()
    }
  }

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

  const handleClose = (): void => {
    // Reset selection atomically when closing
    batch(() => {
      setSelectedRank('')
      setSelectedSuit('')
    })
    props.onClose()
  }

  const handleRankClick = (rank: string) => {
    setSelectedRank(rank)
  }

  const handleSuitClick = (suit: string) => {
    setSelectedSuit(suit)
  }

  const handleRankKeyDown = (event: KeyboardEvent, rank: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRankClick(rank)
    }
  }

  const handleSuitKeyDown = (event: KeyboardEvent, suit: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSuitClick(suit)
    }
  }

  // Add/remove click outside listener
  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside)
  })

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })

  return (
    <Transition name="keyboard-slide">
      {props.isVisible && (
        <div class="card-keyboard" ref={keyboardRef} role="dialog" aria-label="Card selection keyboard">
          <div class="keyboard-content">
            <div class="rank-selection">
              <div class="rank-rows">
                {rankRows.map(row => (
                  <div class="rank-row">
                    {row.map(r => (
                      <button 
                        type="button" 
                        class={`rank-btn ${selectedRank() === r ? 'selected' : ''}`}
                        onClick={() => handleRankClick(r)}
                        onKeyDown={(e) => handleRankKeyDown(e, r)}
                        aria-label={`Select rank ${r}`}
                        aria-pressed={selectedRank() === r}
                        tabindex={0}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div class="suit-selection">
              <div class="suit-grid">
                {SUITS.map(s => (
                  <button 
                    type="button" 
                    class={`suit-btn ${s.name} ${selectedSuit() === s.symbol ? 'selected' : ''}`}
                    onClick={() => handleSuitClick(s.symbol)}
                    onKeyDown={(e) => handleSuitKeyDown(e, s.symbol)}
                    aria-label={`Select ${s.name} suit`}
                    aria-pressed={selectedSuit() === s.symbol}
                    tabindex={0}
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