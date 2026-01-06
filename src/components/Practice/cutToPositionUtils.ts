/**
 * Calculate which card should be on the bottom to make a target card appear at a specific position.
 * 
 * When a card is at the bottom (cutIdx), the top card (position 1) is at index (cutIdx + 1) % N.
 * Position targetPos (1-based) is at index (cutIdx + targetPos) % N.
 * 
 * To make targetIdx appear at position targetPos:
 *   targetIdx = (cutIdx + targetPos) % N
 * Solving for cutIdx:
 *   cutIdx = (targetIdx - targetPos + N) % N
 * 
 * @param stack - The card stack (array of card strings)
 * @param targetCard - The card we want to position
 * @param targetPos - The desired position (1-based, where 1 = top)
 * @returns The card that should be on the bottom
 */
export function calculateCutCard(stack: string[], targetCard: string, targetPos: number): string {
  const N = stack.length
  const targetIdx = stack.indexOf(targetCard)
  if (targetIdx === -1) throw new Error(`Target card ${targetCard} not found in stack`)
  if (targetPos < 1 || targetPos > N) {
    throw new Error(`Target position ${targetPos} is out of range [1, ${N}]`)
  }
  
  // When a card is at the bottom (cutIdx), position targetPos is at index (cutIdx + targetPos) % N
  // To make targetIdx appear at position targetPos: targetIdx = (cutIdx + targetPos) % N
  // Solving for cutIdx: cutIdx = (targetIdx - targetPos + N) % N
  const cutIdx = (targetIdx - targetPos + N) % N
  return stack[cutIdx]
} 