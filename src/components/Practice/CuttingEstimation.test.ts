import { getStack } from '../../constants/stacks'
import { calculateCutAnswer } from './cuttingEstimationUtils'

describe('Cutting Estimation Utils', () => {
  const tamariz = getStack('tamariz')

  describe('calculateCutAnswer', () => {
    it('should return 0 when target is already on top', () => {
      // When K Spades (index 30, position 31) is on bottom,
      // J Diamonds (index 31, position 32) is already on top
      const answer = calculateCutAnswer(tamariz, 'K♠', 'J♦')
      expect(answer).toBe(0)
    })

    it('should return 6 for 8♥ bottom and 3♠ target', () => {
      // 8♥ is at index 13 (position 14)
      // 3♠ is at index 20 (position 21)
      // When 8♥ is bottom, top is 6♠ (index 14)
      // To bring 3♠ to top: cut 6 cards forward
      const answer = calculateCutAnswer(tamariz, '8♥', '3♠')
      expect(answer).toBe(6)
    })

    it('should return correct answer for forward cuts', () => {
      // Test various forward cuts
      // Note: 4♣ is at index 0, so when it's bottom, 2♥ (index 1) is already on top (answer = 0)
      const testCases = [
        { bottom: '4♣', target: '2♥', expected: 0 }, // 2♥ is already on top when 4♣ is bottom
        { bottom: '4♣', target: '7♦', expected: 1 }, // 7♦ is at index 2, when 4♣ (index 0) is bottom, top is 2♥ (index 1), need to cut 1 forward
        { bottom: '4♣', target: '3♣', expected: 2 }, // 3♣ is at index 3, need to cut 2 forward
      ]

      testCases.forEach(({ bottom, target, expected }) => {
        const answer = calculateCutAnswer(tamariz, bottom, target)
        expect(answer).toBe(expected)
      })
    })

    it('should return correct answer for backward cuts', () => {
      // When bottom is at a later position, we might need negative cuts
      // Example: if 3♠ is bottom (index 20), and we want 8♥ on top (index 13)
      // Current top would be 8♠ (index 21)
      // To get 8♥ (index 13) on top, we need to cut backward
      // Let's verify: if 3♠ (index 20) is bottom, top is 8♠ (index 21)
      // To get 8♥ (index 13) on top: (20 + 1 + answer) % 52 = 13
      // (21 + answer) % 52 = 13
      // answer = (13 - 21 + 52) % 52 = 44, normalized = 44 - 52 = -8
      const answer = calculateCutAnswer(tamariz, '3♠', '8♥')
      // This should be a negative number (backward cut)
      expect(answer).toBeLessThan(0)
    })

    it('should handle wrap-around cases', () => {
      // Test cases where cutting wraps around the deck
      const lastCard = tamariz[tamariz.length - 1] // 9♦ at index 51
      const firstCard = tamariz[0] // 4♣ at index 0
      
      // If last card is bottom, first card is already on top
      const answer1 = calculateCutAnswer(tamariz, lastCard, firstCard)
      expect(answer1).toBe(0)
      
      // If last card is bottom, and we want second card on top
      const secondCard = tamariz[1] // 2♥
      const answer2 = calculateCutAnswer(tamariz, lastCard, secondCard)
      expect(answer2).toBe(1)
    })

    it('should normalize large positive answers to negative when backward is shorter', () => {
      // Test a case where the raw answer would be > 26, so it should be normalized
      // to a negative number (shorter path going backward)
      const N = tamariz.length
      
      // Find a case where target is far ahead in the deck
      // If we have a bottom card near the end, and target near the beginning
      // The forward path would be long, so we should use the backward path
      // Example: bottom at index 50, target at index 2
      // Forward: (2 - 50 - 1 + 52) % 52 = 3 (short, so use forward)
      // Let's use a case where backward is actually shorter
      const bottomIdx = 48 // Near the end
      const targetIdx = 2 // Near the beginning  
      const bottomCard = tamariz[bottomIdx]
      const targetCard = tamariz[targetIdx]
      
      const rawAnswer = (targetIdx - bottomIdx - 1 + N) % N
      const answer = calculateCutAnswer(tamariz, bottomCard, targetCard)
      
      // If raw answer > 26, it should be normalized to negative
      if (rawAnswer > N / 2) {
        expect(answer).toBeLessThan(0)
        expect(Math.abs(answer)).toBeLessThan(N / 2)
      } else {
        // Otherwise, forward path is shorter, so answer should be positive
        expect(answer).toBeGreaterThanOrEqual(0)
        expect(answer).toBeLessThanOrEqual(N / 2)
      }
    })

    it('should throw error for invalid bottom card', () => {
      expect(() => {
        calculateCutAnswer(tamariz, 'INVALID', '4♣')
      }).toThrow('Bottom card INVALID not found in stack')
    })

    it('should throw error for invalid target card', () => {
      expect(() => {
        calculateCutAnswer(tamariz, '4♣', 'INVALID')
      }).toThrow('Target card INVALID not found in stack')
    })

    it('should return answers in the range [-26, 26] for a 52-card deck', () => {
      // Test with various random combinations
      for (let i = 0; i < 20; i++) {
        const bottomIdx = Math.floor(Math.random() * tamariz.length)
        const targetIdx = Math.floor(Math.random() * tamariz.length)
        const bottomCard = tamariz[bottomIdx]
        const targetCard = tamariz[targetIdx]
        
        const answer = calculateCutAnswer(tamariz, bottomCard, targetCard)
        expect(answer).toBeGreaterThanOrEqual(-26)
        expect(answer).toBeLessThanOrEqual(26)
      }
    })

    it('should verify the specific user-reported case', () => {
      // User case: Bottom = 8♥, Target = 3♠, Expected = 6
      const answer = calculateCutAnswer(tamariz, '8♥', '3♠')
      expect(answer).toBe(6)
      
      // Verify: if 8♥ (index 13) is bottom, top is 6♠ (index 14)
      // Cutting 6 cards forward: new top = (13 + 1 + 6) % 52 = 20, which is 3♠ ✓
      const bottomIdx = tamariz.indexOf('8♥')
      const targetIdx = tamariz.indexOf('3♠')
      const newTopIdx = (bottomIdx + 1 + answer + tamariz.length) % tamariz.length
      expect(newTopIdx).toBe(targetIdx)
    })

    it('should handle edge case: same card as bottom and target', () => {
      // If bottom and target are the same, we need to cut so that card is on top
      // This means cutting until the card before it is on bottom
      const card = '4♣'
      const answer = calculateCutAnswer(tamariz, card, card)
      // 4♣ is at index 0
      // When 4♣ is bottom, top is at index 1 (2♥)
      // To get 4♣ on top, we need the card before it (9♦ at index 51) to be bottom
      // So: targetIdx (0) = (prevCardIdx (51) + 1 + answer) % 52
      // 0 = (51 + 1 + answer) % 52
      // 0 = (52 + answer) % 52 = answer % 52
      // So answer = 0 or 52, normalized = 0 or -52, but since we want shortest path:
      // Actually, if 4♣ is bottom and we want it on top, we cut backward 1 card
      // (so 9♦ becomes bottom, making 4♣ the top)
      // When card is bottom, top is (cardIdx + 1) % N
      // To get card on top: cardIdx = (newBottomIdx + 1 + answer) % N
      // newBottomIdx = (cardIdx - 1 + N) % N (the card before)
      // So: cardIdx = ((cardIdx - 1 + N) % N + 1 + answer) % N
      // Simplifying: answer = -1 (mod N), normalized = -1
      expect(answer).toBe(-1)
    })
  })
})

