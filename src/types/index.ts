export interface QuizQuestion {
  card?: string;
  pos?: number;
  answer: string | number;
  type: 'card-to-pos' | 'pos-to-card' | 'one-ahead' | 'context-prev' | 'context-next' | 'cutting' | 'first-or-second-half' | 'quartet-position';
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

export interface Stats {
  cardFails: Record<string, number>;
  posFails: Record<string, number>;
  total: number;
  correct: number;
  history: AttemptHistory[];
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