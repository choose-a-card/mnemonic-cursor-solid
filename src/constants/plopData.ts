/**
 * PLOP (Denis Behr) data for the Tamariz Stack.
 *
 * For each of the 13 values you memorize two things:
 *  1. The suit of the card that is cut to the bottom of the pack.
 *  2. A triplet of numbers representing the relative distances of the
 *     remaining three cards from the top of the deck:
 *       - First number: position of the 1st card from the top.
 *       - Second number: distance from the 1st card to the 2nd card.
 *       - Third number: distance from the 2nd card to the 3rd card.
 */

export interface PlopEntry {
  cutCard: string;           // Full card notation, e.g. "A♦"
  cutSuit: string;           // Suit symbol only, e.g. "♦"
  distances: [number, number, number];
}

export const PLOP_DATA: Record<string, PlopEntry> = {
  'A':  { cutCard: 'A♦',  cutSuit: '♦', distances: [4, 8, 8] },
  '2':  { cutCard: '2♥',  cutSuit: '♥', distances: [8, 9, 8] },
  '3':  { cutCard: '3♣',  cutSuit: '♣', distances: [8, 9, 7] },
  '4':  { cutCard: '4♠',  cutSuit: '♠', distances: [2, 11, 4] },
  '5':  { cutCard: '5♥',  cutSuit: '♥', distances: [8, 9, 5] },
  '6':  { cutCard: '6♣',  cutSuit: '♣', distances: [8, 9, 8] },
  '7':  { cutCard: '7♠',  cutSuit: '♠', distances: [4, 6, 8] },
  '8':  { cutCard: '8♥',  cutSuit: '♥', distances: [8, 7, 4] },
  '9':  { cutCard: '9♣',  cutSuit: '♣', distances: [8, 9, 8] },
  '10': { cutCard: '10♣', cutSuit: '♣', distances: [10, 4, 11] },
  'J':  { cutCard: 'J♥',  cutSuit: '♥', distances: [12, 4, 9] },
  'Q':  { cutCard: 'Q♦',  cutSuit: '♦', distances: [2, 15, 2] },
  'K':  { cutCard: 'K♣',  cutSuit: '♣', distances: [8, 5, 4] },
}
