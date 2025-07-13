import { RANKS, SUITS } from "../constants/cards"

export function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max)
}

export function isValidCard(card: string): boolean {
    if (!card || card.length < 2) {
        return false
    }
    
    // Extract suit symbols from SUITS array
    const validSuits = SUITS.map(suit => suit.symbol)
    
    // Check if the last character is a valid suit
    const lastChar = card[card.length - 1]
    if (!validSuits.includes(lastChar)) {
        return false
    }
    
    // Extract the rank (everything except the last character)
    const rank = card.slice(0, -1)
    
    // Check if the rank is valid
    return RANKS.includes(rank)
}