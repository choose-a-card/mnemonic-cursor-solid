export interface QuizQuestion {
  card?: string;
  pos?: number;
  answer: string | number;
  type: 'card-to-pos' | 'pos-to-card' | 'one-ahead' | 'context-prev' | 'context-next' | 'cutting' | 'first-or-second-half' | 'quartet-position' | 'cut-to-position' | 'plop-denis-behr';
  targetCard?: string;
  cutCard?: string;
  targetPos?: number;
  cutPos?: number;
}

export interface QuizResult {
  correct: boolean;
  question: QuizQuestion;
  input: string;
  mode: string;
}

export interface AttemptHistory {
  timestamp: number;
  correct: boolean;
  mode: string;
  question: QuizQuestion;
  input: string;
}

export interface ModeStats {
  total: number;
  correct: number;
  accuracy: number;
  // Per-mode failure tracking (context-aware)
  cardFails?: Record<string, number>;
  posFails?: Record<string, number>;
  lastAttempt?: number; // Timestamp of last attempt
}

export interface Stats {
  // REMOVED: Global cardFails and posFails (they mixed contexts)
  total: number;
  correct: number;
  history: AttemptHistory[];
  modeStats: Record<string, ModeStats>;
}

export interface TabInfo {
  label: string;
  icon: string;
  id: string;
}

export interface PracticeMode {
  id: string;
  name: string;
  icon: string;
}

export interface CardInterval {
  start: number;
  end: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'accuracy' | 'practice' | 'modes' | 'streaks' | 'milestones';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface BadgeProgress {
  badges: Badge[];
  lastUnlocked: Badge | null;
}

export interface CustomStack {
  id: string;
  name: string;
  cards: string[];
  createdAt: number;
  updatedAt: number;
}
