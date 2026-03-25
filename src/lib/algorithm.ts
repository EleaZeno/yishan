// Bayesian Spaced Repetition Algorithm

export interface WordState {
  alpha: number;
  beta: number;
  halflife: number;
  lastSeen: number;
  totalExposure: number;
  dueDate: number;
}

export function getInitialWordState(): WordState {
  return {
    alpha: 1,
    beta: 1,
    halflife: 1440, // 1 day in minutes
    lastSeen: Date.now(),
    totalExposure: 0,
    dueDate: Date.now(),
  };
}

export function predictRecallProbability(word: any, now: number): number {
  if (!word.lastSeen || !word.halflife) return 0.5;
  const elapsed = (now - word.lastSeen) / 60000; // minutes
  return Math.pow(0.5, elapsed / word.halflife);
}

export function updateWordState(word: any, success: boolean): Partial<WordState> {
  const alpha = (word.alpha || 1) + (success ? 1 : 0);
  const beta = (word.beta || 1) + (success ? 0 : 1);
  const successRate = alpha / (alpha + beta);
  
  // Update halflife based on success
  const halflife = success
    ? Math.min((word.halflife || 1440) * 2, 525600) // max 1 year
    : Math.max((word.halflife || 1440) * 0.5, 60);  // min 1 hour
  
  const now = Date.now();
  const dueDate = now + halflife * 60000;
  
  return {
    alpha,
    beta,
    halflife,
    lastSeen: now,
    totalExposure: (word.totalExposure || 0) + 1,
    dueDate,
  };
}

export const algorithm = {
  calculateNextReview: (word: any) => {
    const halflife = word.halflife || 1440;
    return halflife * 60000; // ms
  },
  calculateEaseFactor: (word: any) => {
    const alpha = word.alpha || 1;
    const beta = word.beta || 1;
    return alpha / (alpha + beta);
  },
};

export default algorithm;
