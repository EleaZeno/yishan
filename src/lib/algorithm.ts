// Bayesian Spaced Repetition Algorithm

export interface WordState {
  alpha: number;
  beta: number;
  halflife: number;
  lastSeen: number;
  totalExposure: number;
  dueDate: number;
}

export interface InteractionMetrics {
  durationMs: number;
  isFlipped: boolean;
  audioPlayedCount: number;
  direction: 'left' | 'right';
}

export function getInitialWordState(): WordState {
  return {
    alpha: 1,
    beta: 1,
    halflife: 1440,
    lastSeen: Date.now(),
    totalExposure: 0,
    dueDate: Date.now(),
  };
}

export function predictRecallProbability(word: any, now: number): number {
  if (!word.lastSeen || !word.halflife) return 0.5;
  const elapsed = (now - word.lastSeen) / 60000;
  return Math.pow(0.5, elapsed / word.halflife);
}

export function evaluateInteraction(word: any, metrics: InteractionMetrics): Partial<WordState> {
  const success = metrics.direction === 'left';
  const alpha = (word.alpha || 1) + (success ? 1 : 0);
  const beta = (word.beta || 1) + (success ? 0 : 1);
  const halflife = success
    ? Math.min((word.halflife || 1440) * 2.0, 525600)
    : Math.max((word.halflife || 1440) * 0.5, 60);
  const now = Date.now();
  return {
    alpha, beta, halflife,
    lastSeen: now,
    totalExposure: (word.totalExposure || 0) + 1,
    dueDate: now + halflife * 60000,
  };
}

export const algorithm = {
  calculateNextReview: (word: any) => (word.halflife || 1440) * 60000,
  calculateEaseFactor: (word: any) => {
    const alpha = word.alpha || 1;
    const beta = word.beta || 1;
    return alpha / (alpha + beta);
  },
};

export default algorithm;
