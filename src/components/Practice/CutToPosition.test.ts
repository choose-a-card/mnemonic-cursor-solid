import { getStack } from '../../constants/stacks'
import { calculateCutCard } from './cutToPositionUtils'

describe('Cut to Position', () => {
  const tamariz = getStack('tamariz')

  it('should return A♥ for A♣ to position 44', () => {
    expect(calculateCutCard(tamariz, 'A♣', 44)).toBe('A♥')
  })

  it('should return 7♥ for A♣ to position 2', () => {
    expect(calculateCutCard(tamariz, 'A♣', 2)).toBe('7♥')
  })

  it('should return 9♦ for 4♣ to position 1', () => {
    expect(calculateCutCard(tamariz, '4♣', 1)).toBe('9♦')
  })

  it('should return 10♥ for Q♠ to position 10', () => {
    expect(calculateCutCard(tamariz, 'Q♠', 10)).toBe('10♥')
  })

  // Additional edge cases
  it('should return the card before the target for target at position 1', () => {
    // For 7♥ at position 1, cut card should be the card before 7♥ in the stack
    const idx = tamariz.indexOf('7♥')
    const expected = tamariz[(idx - 1 + 52) % 52]
    expect(calculateCutCard(tamariz, '7♥', 1)).toBe(expected)
  })

  it('should return the card after the target for target at position 52', () => {
    // For 7♥ at position 52, cut card should be the card after 7♥ in the stack
    const idx = tamariz.indexOf('7♥')
    const expected = tamariz[(idx - 52 + 52) % 52]
    expect(calculateCutCard(tamariz, '7♥', 52)).toBe(expected)
  })

  it('should return the bottom card if target is already at desired position', () => {
    // For 7♥ at its current position, cut card should be the current bottom card
    const idx = tamariz.indexOf('7♥')
    const pos = idx + 1
    const expected = tamariz[(idx - pos + 52) % 52]
    expect(calculateCutCard(tamariz, '7♥', pos)).toBe(expected)
  })

  it('should handle wrap-around for first card to last position', () => {
    // For the first card to position 52
    const expected = tamariz[(0 - 52 + 52) % 52]
    expect(calculateCutCard(tamariz, tamariz[0], 52)).toBe(expected)
  })

  it('should handle wrap-around for last card to first position', () => {
    // For the last card to position 1
    const expected = tamariz[(51 - 1 + 52) % 52]
    expect(calculateCutCard(tamariz, tamariz[51], 1)).toBe(expected)
  })
}) 