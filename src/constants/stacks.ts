import type { CustomStack } from '../types';

export type Card = string;

export type PresetStackType = 'tamariz' | 'aronson' | 'faro';
export type StackType = PresetStackType | `custom-${string}`;

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

export const STACKS: Record<PresetStackType, StackInfo> = {
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

export const PRESET_STACKS: PresetStackType[] = ['tamariz', 'aronson', 'faro'];

export const isCustomStackType = (stackType: StackType): stackType is `custom-${string}` => {
  return stackType.startsWith('custom-');
};

export const getCustomStackId = (stackType: StackType): string | null => {
  if (!isCustomStackType(stackType)) return null;
  return stackType.replace('custom-', '');
};

export const createCustomStackType = (id: string): StackType => {
  return `custom-${id}` as StackType;
};

export const getStack = (stackType: StackType, customStacks?: CustomStack[]): Card[] => {
  if (isCustomStackType(stackType) && customStacks) {
    const customId = getCustomStackId(stackType);
    const customStack = customStacks.find(s => s.id === customId);
    return customStack?.cards || [];
  }
  if (isCustomStackType(stackType)) {
    return [];
  }
  return STACKS[stackType as PresetStackType].cards;
};

export const getStackTitle = (stackType: StackType, customStacks?: CustomStack[]): string => {
  if (isCustomStackType(stackType) && customStacks) {
    const customId = getCustomStackId(stackType);
    const customStack = customStacks.find(s => s.id === customId);
    return customStack?.name || 'Custom Stack';
  }
  if (isCustomStackType(stackType)) {
    return 'Custom Stack';
  }
  return STACKS[stackType as PresetStackType].name;
};

export const getStackDescription = (stackType: StackType, customStacks?: CustomStack[]): string => {
  if (isCustomStackType(stackType) && customStacks) {
    const customId = getCustomStackId(stackType);
    const customStack = customStacks.find(s => s.id === customId);
    return customStack ? 'Your custom memorized deck order.' : 'Custom stack not found.';
  }
  if (isCustomStackType(stackType)) {
    return 'Your custom memorized deck order.';
  }
  return STACKS[stackType as PresetStackType].description;
};
