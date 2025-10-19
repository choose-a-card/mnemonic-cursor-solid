export interface PracticeMode {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const PRACTICE_MODES: PracticeMode[] = [
  { 
    id: 'card-to-pos', 
    name: 'Card → Position', 
    icon: '🎯', 
    description: 'Given a card, identify its position in the stack'
  },
  { 
    id: 'pos-to-card', 
    name: 'Position → Card', 
    icon: '🔍', 
    description: 'Given a position, identify which card is there'
  },
  { 
    id: 'one-ahead', 
    name: 'One Ahead', 
    icon: '⏭️', 
    description: 'Given a card, predict what card comes next in the stack'
  },
  { 
    id: 'context', 
    name: 'Stack Context', 
    icon: '🔗', 
    description: 'Practice knowing which cards come before and after any given card'
  },
  { 
    id: 'cutting', 
    name: 'Cutting Estimation', 
    icon: '✂️', 
    description: 'Estimate how many cards to cut to reach a target card from any position'
  },
  { 
    id: 'first-or-second-half', 
    name: 'First or Second Half', 
    icon: '🃏', 
    description: 'Given a card, say if it is in the first (1-26) or second (27-52) half of the deck'
  },
  { 
    id: 'quartet-position', 
    name: 'Quartet Position', 
    icon: '4️⃣', 
    description: 'Enter the positions of all four cards of a given rank (e.g., all 7s)'
  },
  { 
    id: 'cut-to-position', 
    name: 'Cut to Position', 
    icon: '🔀', 
    description: 'Given a target card and position, enter the cut card needed to put the target at that position'
  },
]

