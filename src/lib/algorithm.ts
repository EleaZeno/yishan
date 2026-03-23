export function getInitialWordState() {
  return {
    halflife: 10080,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: Date.now(),
    lastReview: null,
    totalReviews: 0,
    correctReviews: 0,
    streak: 0
  };
}

export function predictRecallProbability(word: any, now: number = Date.now()): number {
  if (!word || !word.halflife) return 0.5;
  const timeSinceReview = now - (word.lastReview || word.createdAt);
  const halflifeMs = word.halflife * 60 * 1000;
  return Math.max(0, Math.min(1, Math.pow(0.5, timeSinceReview / halflifeMs)));
}

export function calculateNextReview(word: any, quality: number): any {
  const now = Date.now();
  let { halflife, easeFactor, interval, repetitions } = word;
  
  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }
  
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  halflife = interval * halflife;
  
  return {
    ...word,
    halflife,
    easeFactor,
    interval,
    repetitions,
    nextReview: now + interval * 24 * 60 * 60 * 1000,
    lastReview: now,
    totalReviews: (word.totalReviews || 0) + 1,
    correctReviews: (word.correctReviews || 0) + (quality >= 3 ? 1 : 0)
  };
}

export function evaluateInteraction(word: any, responseTime: number, quality: number): any {
  const speedFactor = Math.max(0.5, Math.min(1.5, responseTime / 5000));
  const adjustedQuality = Math.round(quality * speedFactor);
  return calculateNextReview(word, adjustedQuality);
}

export { predictRecallProbability as recall };

export default {
  getInitialWordState,
  predictRecallProbability,
  calculateNextReview,
  evaluateInteraction
};
