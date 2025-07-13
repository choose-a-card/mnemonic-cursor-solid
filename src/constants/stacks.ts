export type Card = string;

export type StackType = 'tamariz' | 'aronson' | 'faro';

export interface StackInfo {
  name: string;
  description: string;
  cards: Card[];
}

export const TAMARIZ_STACK: Card[] = [
  '4♣','2♥','7♦','3♣','4♥','6♦','A♠','5♥','9♠','2♠','Q♥','3♦','Q♣','8♥','6♠','5♠','9♥','K♣','2♦','J♥','3♠','8♠','6♥','10♣','5♦','K♦','2♣','3♥','8♦','5♣','K♠','J♦','8♣','10♠','K♥','J♣','7♠','10♥','A♦','4♠','7♥','4♦','A♣','9♣','J♠','Q♦','7♣','Q♠','10♦','6♣','A♥','9♦',
];

export const ARONSON_STACK: Card[] = [
  'J♠','K♣','5♣','2♥','9♠','A♠','3♥','6♣','8♦','A♣','10♠','5♥','2♦',
  'K♦','7♦','8♣','3♠','A♦','7♠','5♠','Q♦','A♥','8♠','3♦','7♥','Q♥',
  '5♦','7♣','4♥','K♥','4♦','10♦','J♣','J♥','10♣','J♦','4♠','10♥','6♥',
  '3♣','2♠','9♥','K♠','6♠','4♣','8♥','9♣','Q♠','6♦','Q♣','2♣','9♦',
];

export const FARO_STACK: Card[] = [
  'A♠', '9♠', '4♥', 'Q♥', '7♣', '2♦', '10♦', '6♠', 'A♥', '9♥',
  '4♣', 'Q♣', '7♦', '3♠', 'J♠', '6♥', 'A♣', '9♣', '4♦', 'Q♦',
  '8♠', '3♥', 'J♥', '6♣', 'A♦', '9♦', '5♠', 'K♠', '8♥', '3♣',
  'J♣', '6♦', '2♠', '10♠', '5♥', 'K♥', '8♣', '3♦', 'J♦', '7♠',
  '2♥', '10♥', '5♣', 'K♣', '8♦', '4♠', 'Q♠', '7♥', '2♣', '10♣',
  '5♦', 'K♦'
];

export const STACKS: Record<StackType, StackInfo> = {
  tamariz: {
    name: 'Tamariz Stack',
    description: 'The complete Juan Tamariz memorized deck order, widely used in professional magic.',
    cards: TAMARIZ_STACK
  },
  aronson: {
    name: 'Aronson Stack',
    description: 'Simon Aronson\'s "Aronson Stack" - another popular memorized deck system.',
    cards: ARONSON_STACK
  },
  faro: {
    name: '5th Faro Stack',
    description: 'A mathematically derived stack based on the 5th perfect faro shuffle, creating a unique memorized order.',
    cards: FARO_STACK
  }
};

export const getStack = (stackType: StackType): Card[] => {
  return STACKS[stackType].cards;
};

export const getStackTitle = (stackType: StackType): string => {
  return STACKS[stackType].name;
};

export const getStackDescription = (stackType: StackType): string => {
  return STACKS[stackType].description;
}; 