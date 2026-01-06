/**
 * Calculate how many cards to cut to bring a target card to the top
 * when a given card is on the bottom.
 * 
 * @param stack - The card stack (array of card strings)
 * @param bottomCard - The card currently on the bottom
 * @param targetCard - The card we want to bring to the top
 * @returns The number of cards to cut (positive = forward, negative = backward)
 */
export function calculateCutAnswer(
  stack: string[],
  bottomCard: string,
  targetCard: string
): number {
  const N = stack.length
  const cutIdx = stack.indexOf(bottomCard)
  const targetIdx = stack.indexOf(targetCard)
  
  if (cutIdx === -1) {
    throw new Error(`Bottom card ${bottomCard} not found in stack`)
  }
  if (targetIdx === -1) {
    throw new Error(`Target card ${targetCard} not found in stack`)
  }
  
  // When a card is at the bottom (cutIdx), the top card is at (cutIdx + 1) % N
  // To bring the target card to the top, we need:
  // targetIdx = (cutIdx + 1 + answer) % N
  // Solving for answer: answer = (targetIdx - cutIdx - 1 + N) % N
  // Normalize to [-N/2, N/2] range to get the shortest path
  let answer = (targetIdx - cutIdx - 1 + N) % N
  if (answer > N / 2) {
    answer = answer - N
  }
  
  return answer
}

