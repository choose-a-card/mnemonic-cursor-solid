import { createSignal, createMemo, onMount, Show, For } from 'solid-js'
import { useParams, useNavigate } from '@solidjs/router'
import { useCustomStacks } from '../contexts/CustomStacksContext'
import { useAppSettings } from '../contexts/AppSettingsContext'
import { RANKS, SUITS } from '../constants/cards'
import Input from '../components/shared/Input'
import './StackBuilderPage.css'

const TOTAL_CARDS = 52

export default function StackBuilderPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { addStack, updateStack, getStackById } = useCustomStacks()
  const { darkMode } = useAppSettings()

  const isEditing = () => !!params.id
  const existingStack = () => params.id ? getStackById(params.id) : undefined

  const [stackName, setStackName] = createSignal('')
  const [cards, setCards] = createSignal<(string | null)[]>(Array(TOTAL_CARDS).fill(null))
  const [selectedPosition, setSelectedPosition] = createSignal<number>(0)
  const [isMobile, setIsMobile] = createSignal(false)

  onMount(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Load existing stack if editing
    if (existingStack()) {
      setStackName(existingStack()!.name)
      setCards([...existingStack()!.cards])
    }

    return () => window.removeEventListener('resize', checkMobile)
  })

  const usedCards = createMemo(() => {
    const used = new Set<string>()
    cards().forEach(card => {
      if (card) used.add(card)
    })
    return used
  })

  const filledCount = createMemo(() => cards().filter(c => c !== null).length)
  const isComplete = createMemo(() => filledCount() === TOTAL_CARDS)
  const canSave = createMemo(() => isComplete() && stackName().trim().length > 0)

  const handleCardSelect = (card: string) => {
    const currentPosition = selectedPosition()
    const currentCard = cards()[currentPosition]
    
    // If this position already has this card, do nothing
    if (currentCard === card) return

    setCards(prev => {
      const newCards = [...prev]
      newCards[currentPosition] = card
      return newCards
    })

    // Auto-advance to next empty position
    const nextEmpty = findNextEmptyPosition(currentPosition)
    if (nextEmpty !== -1) {
      setSelectedPosition(nextEmpty)
    }
  }

  const handleClearPosition = () => {
    const currentPosition = selectedPosition()
    setCards(prev => {
      const newCards = [...prev]
      newCards[currentPosition] = null
      return newCards
    })
  }

  const handleClearAll = () => {
    setCards(Array(TOTAL_CARDS).fill(null))
    setSelectedPosition(0)
  }

  const findNextEmptyPosition = (fromPosition: number): number => {
    // First check positions after current
    for (let i = fromPosition + 1; i < TOTAL_CARDS; i++) {
      if (cards()[i] === null) return i
    }
    // Then check positions before current
    for (let i = 0; i < fromPosition; i++) {
      if (cards()[i] === null) return i
    }
    return -1
  }

  const handlePositionClick = (position: number) => {
    setSelectedPosition(position)
  }

  const handleSave = () => {
    if (!canSave()) return

    const stackCards = cards() as string[]
    
    if (isEditing() && params.id) {
      updateStack(params.id, {
        name: stackName().trim(),
        cards: stackCards
      })
    } else {
      addStack({
        name: stackName().trim(),
        cards: stackCards
      })
    }

    navigate('/settings')
  }

  const handleBack = () => {
    navigate('/settings')
  }

  const handlePrevPosition = () => {
    setSelectedPosition(prev => prev > 0 ? prev - 1 : TOTAL_CARDS - 1)
  }

  const handleNextPosition = () => {
    setSelectedPosition(prev => prev < TOTAL_CARDS - 1 ? prev + 1 : 0)
  }

  const progressPercentage = createMemo(() => (filledCount() / TOTAL_CARDS) * 100)

  return (
    <div class={`stack-builder-page ${darkMode() ? 'dark' : ''}`}>
      {/* Header */}
      <header class="builder-header">
        <button 
          class="back-button" 
          onClick={handleBack}
          aria-label="Go back to settings"
          tabindex="0"
        >
          ← Back
        </button>
        <h1 class="builder-title">
          {isEditing() ? 'Edit Stack' : 'Create Stack'}
        </h1>
        <button
          class="save-button"
          onClick={handleSave}
          disabled={!canSave()}
          aria-label="Save stack"
          tabindex="0"
        >
          Save
        </button>
      </header>

      {/* Stack Name Input */}
      <div class="name-section">
        <Input
          type="text"
          value={stackName()}
          onInput={setStackName}
          placeholder="Enter stack name..."
          ariaLabel="Stack name"
          class="stack-name-input"
        />
      </div>

      {/* Progress Bar */}
      <div class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style={{ width: `${progressPercentage()}%` }}
          />
        </div>
        <div class="progress-info">
          <span class="progress-text">{filledCount()} / {TOTAL_CARDS} cards</span>
          <Show when={isComplete()}>
            <span class="progress-complete">✓ Complete</span>
          </Show>
        </div>
      </div>

      {/* Main Builder Area */}
      <div class="builder-main">
        {/* Position Grid - Desktop shows all, Mobile shows navigator */}
        <Show 
          when={!isMobile()}
          fallback={
            <div class="mobile-position-nav">
              <button 
                class="nav-btn"
                onClick={handlePrevPosition}
                aria-label="Previous position"
                tabindex="0"
              >
                ←
              </button>
              <div class="current-position-display">
                <span class="position-label">Position</span>
                <span class="position-number">{selectedPosition() + 1}</span>
                <span class="position-card">
                  {cards()[selectedPosition()] || '—'}
                </span>
              </div>
              <button 
                class="nav-btn"
                onClick={handleNextPosition}
                aria-label="Next position"
                tabindex="0"
              >
                →
              </button>
            </div>
          }
        >
          <div class="position-grid-section">
            <div class="section-header">
              <h2 class="section-title">Positions</h2>
              <button 
                class="clear-all-btn"
                onClick={handleClearAll}
                aria-label="Clear all positions"
                tabindex="0"
              >
                Clear All
              </button>
            </div>
            <div class="position-grid">
              <For each={Array(TOTAL_CARDS).fill(null)}>
                {(_, index) => (
                  <button
                    class={`position-cell ${selectedPosition() === index() ? 'selected' : ''} ${cards()[index()] ? 'filled' : 'empty'}`}
                    onClick={() => handlePositionClick(index())}
                    aria-label={`Position ${index() + 1}: ${cards()[index()] || 'empty'}`}
                    tabindex="0"
                  >
                    <span class="position-num">{index() + 1}</span>
                    <span class="position-card-value">
                      {cards()[index()] || '—'}
                    </span>
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Card Selector */}
        <div class="card-selector-section">
          <div class="section-header">
            <h2 class="section-title">
              Select card for position {selectedPosition() + 1}
            </h2>
            <Show when={cards()[selectedPosition()]}>
              <button 
                class="clear-btn"
                onClick={handleClearPosition}
                aria-label="Clear current position"
                tabindex="0"
              >
                Clear
              </button>
            </Show>
          </div>
          <div class="card-selector">
            <For each={SUITS}>
              {(suit) => (
                <div class="suit-row">
                  <span class={`suit-symbol ${suit.name}`}>{suit.symbol}</span>
                  <div class="rank-buttons">
                    <For each={RANKS}>
                      {(rank) => {
                        const card = `${rank}${suit.symbol}`
                        const isUsed = () => usedCards().has(card) && cards()[selectedPosition()] !== card
                        const isSelected = () => cards()[selectedPosition()] === card
                        return (
                          <button
                            class={`rank-btn ${isUsed() ? 'used' : ''} ${isSelected() ? 'selected' : ''}`}
                            onClick={() => !isUsed() && handleCardSelect(card)}
                            disabled={isUsed()}
                            aria-label={`${rank} of ${suit.name}`}
                            tabindex={isUsed() ? -1 : 0}
                          >
                            {rank}
                          </button>
                        )
                      }}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Mobile: Quick position jumper */}
      <Show when={isMobile()}>
        <div class="mobile-position-grid">
          <div class="mini-grid">
            <For each={Array(TOTAL_CARDS).fill(null)}>
              {(_, index) => (
                <button
                  class={`mini-cell ${selectedPosition() === index() ? 'selected' : ''} ${cards()[index()] ? 'filled' : ''}`}
                  onClick={() => handlePositionClick(index())}
                  aria-label={`Jump to position ${index() + 1}`}
                  tabindex="0"
                >
                  {index() + 1}
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

