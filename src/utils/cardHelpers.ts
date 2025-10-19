export const getCardColorClass = (card: string): string => {
  if (card.includes('♥') || card.includes('♦')) {
    return 'card-red'
  }
  return 'card-black'
}

export const getCardSuit = (card: string): string => {
  if (card.includes('♠')) return '♠'
  if (card.includes('♥')) return '♥'
  if (card.includes('♦')) return '♦'
  if (card.includes('♣')) return '♣'
  return ''
}

export const getCardValue = (card: string): string => {
  return card.replace(/[♠♥♦♣]/g, '').trim()
}

