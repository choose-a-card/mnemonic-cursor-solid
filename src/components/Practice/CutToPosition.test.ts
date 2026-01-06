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

  it('should verify the formula: when cut card is bottom, target appears at correct position', () => {
    // Comprehensive test: verify that when the calculated cut card is on bottom,
    // the target card actually appears at the specified position
    const testCases = [
      { target: '4♣', pos: 1 },
      { target: '3♠', pos: 10 },
      { target: 'K♠', pos: 5 },
      { target: 'A♣', pos: 44 },
      { target: '7♥', pos: 26 },
    ]

    testCases.forEach(({ target, pos }) => {
      const cutCard = calculateCutCard(tamariz, target, pos)
      const cutIdx = tamariz.indexOf(cutCard)
      const targetIdx = tamariz.indexOf(target)
      
      // When cutCard is bottom, position pos should be at index (cutIdx + pos) % N
      const actualIdxAtPos = (cutIdx + pos) % tamariz.length
      expect(actualIdxAtPos).toBe(targetIdx)
    })
  })

  it('should handle edge case: target at its current position', () => {
    // If target is already at the desired position, the cut card should be
    // the card that makes that position the top
    const target = '4♣' // at index 0, position 1
    const pos = 1 // top position
    const cutCard = calculateCutCard(tamariz, target, pos)
    const cutIdx = tamariz.indexOf(cutCard)
    
    // When cutCard is bottom, position 1 should be the target
    const topCard = tamariz[(cutIdx + 1) % tamariz.length]
    expect(topCard).toBe(target)
  })

  it('should throw error for invalid target card', () => {
    expect(() => {
      calculateCutCard(tamariz, 'INVALID', 1)
    }).toThrow('Target card INVALID not found in stack')
  })

  it('should throw error for position out of range', () => {
    expect(() => {
      calculateCutCard(tamariz, '4♣', 0)
    }).toThrow('Target position 0 is out of range [1, 52]')
    
    expect(() => {
      calculateCutCard(tamariz, '4♣', 53)
    }).toThrow('Target position 53 is out of range [1, 52]')
  })

  it('should work correctly for all positions 1-52', () => {
    // Test that the formula works for every position
    const target = '3♠'
    const targetIdx = tamariz.indexOf(target)
    
    for (let pos = 1; pos <= 52; pos++) {
      const cutCard = calculateCutCard(tamariz, target, pos)
      const cutIdx = tamariz.indexOf(cutCard)
      
      // Verify: when cutCard is bottom, position pos should be the target
      const actualIdxAtPos = (cutIdx + pos) % tamariz.length
      expect(actualIdxAtPos).toBe(targetIdx)
    }
  })
}) 