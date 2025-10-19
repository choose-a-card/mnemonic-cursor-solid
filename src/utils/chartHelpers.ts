export interface SessionData {
  session: number;
  accuracy: number;
}

export const createAccuracyChart = (history: any[]): SessionData[] | null => {
  if (history.length < 2) return null
  
  // Group by sessions (every 10 attempts)
  const sessions: SessionData[] = []
  for (let i = 0; i < history.length; i += 10) {
    const session = history.slice(i, i + 10)
    const accuracy = (session.filter(h => h.correct).length / session.length) * 100
    sessions.push({ session: Math.floor(i / 10) + 1, accuracy })
  }
  
  // Only show the last 8 sessions to prevent overflow
  return sessions.slice(-8)
}

