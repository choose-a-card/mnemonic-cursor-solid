export function calculateCutCard(stack: string[], targetCard: string, targetPos: number): string {
  const N = stack.length
  const targetIdx = stack.indexOf(targetCard)
  if (targetIdx === -1) throw new Error('Card not found in stack')
  const cutIdx = (targetIdx - (targetPos) + N) % N
  return stack[cutIdx]
} 