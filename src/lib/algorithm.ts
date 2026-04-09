// ============================================================
// yishan Algorithm v2.0 - Adaptive Bayesian Memory Model
//
// Features:
// - Content-type aware intervals
// - Reaction time adjustment
// - Personalized forgetting curve
// ============================================================

import { Word, ContentType, InteractionMetrics } from '../types';

export interface WordState {
  alpha: number;
  beta: number;
  halflife: number;
  lastSeen: number;
  totalExposure: number;
  dueDate: number;
}

// ============================================================
// Content-type specific base intervals (minutes)
// ============================================================
const BASE_INTERVALS: Record<ContentType, number> = {
  word: 1440,           // 1 day
  formula: 720,         // 12 hours (abstract, harder)
  knowledge: 1440,      // 1 day
  mistake: 360,         // 6 hours (errors need frequent review)
  definition: 1440,     // 1 day
};

// Maximum halflife (1 year in minutes)
const MAX_HALFLIFE = 525600;

// Minimum halflife (1 hour)
const MIN_HALFLIFE = 60;

// ============================================================
// Core Algorithm Functions
// ============================================================

export function getInitialWordState(contentType: ContentType = 'word'): WordState {
  const now = Date.now();
  const baseHalflife = BASE_INTERVALS[contentType] || 1440;
  
  return {
    alpha: 1,
    beta: 1,
    halflife: baseHalflife,
    lastSeen: now,
    totalExposure: 0,
    dueDate: now,
  };
}

/**
 * Predict recall probability using exponential decay
 * P(recall) = 0.5^(elapsed/halflife)
 */
export function predictRecallProbability(word: Word, now: number): number {
  if (!word.lastSeen || !word.halflife) return 0.5;
  const elapsed = (now - word.lastSeen) / 60000; // minutes
  return Math.pow(0.5, elapsed / word.halflife);
}

/**
 * Calculate stability score (0-100)
 * Higher = more stable in long-term memory
 */
export function calculateStability(word: Word): number {
  if (!word.halflife) return 0;
  // Map halflife to stability score
  // halflife 1440 (1 day) = 20
  // halflife 10080 (1 week) = 50
  // halflife 43200 (30 days) = 80
  // halflife 525600 (1 year) = 100
  const logHalflife = Math.log10(word.halflife);
  const logMin = Math.log10(60);
  const logMax = Math.log10(525600);
  return Math.round(((logHalflife - logMin) / (logMax - logMin)) * 100);
}

/**
 * Evaluate interaction and compute new word state
 * 
 * Key factors:
 * 1. Direction (left=mastered, right=review)
 * 2. Reaction time (faster = better retention)
 * 3. Content type (affects interval multipliers)
 */
export function evaluateInteraction(
  word: Word, 
  metrics: InteractionMetrics
): Partial<WordState> {
  const success = metrics.direction === 'left';
  const now = Date.now();
  
  // Update Bayesian parameters
  const alpha = (word.alpha || 1) + (success ? 1 : 0);
  const beta = (word.beta || 1) + (success ? 0 : 1);
  
  // Calculate reaction time factor
  // Fast (<2s): 1.5x multiplier
  // Medium (2-5s): 1.2x multiplier
  // Slow (>5s): 1.0x multiplier
  let timeFactor = 1.0;
  if (success && metrics.durationMs) {
    if (metrics.durationMs < 2000) {
      timeFactor = 1.5;
    } else if (metrics.durationMs < 5000) {
      timeFactor = 1.2;
    }
  }
  
  // Content-type specific multipliers
  const contentType = word.contentType || 'word';
  let successMultiplier = 2.0;
  let failMultiplier = 0.5;
  
  switch (contentType) {
    case 'formula':
      successMultiplier = 1.8;  // Slower growth for abstract content
      failMultiplier = 0.4;     // Faster reset on failure
      break;
    case 'mistake':
      successMultiplier = 2.2;  // Faster growth for error correction
      failMultiplier = 0.3;     // Quick reset to re-learn
      break;
    case 'knowledge':
      successMultiplier = 2.0;
      failMultiplier = 0.5;
      break;
  }
  
  // Calculate new halflife
  let newHalflife: number;
  if (success) {
    newHalflife = Math.min(
      (word.halflife || 1440) * successMultiplier * timeFactor,
      MAX_HALFLIFE
    );
  } else {
    newHalflife = Math.max(
      (word.halflife || 1440) * failMultiplier,
      MIN_HALFLIFE
    );
  }
  
  // Calculate next due date
  const dueDate = now + newHalflife * 60000;
  
  return {
    alpha,
    beta,
    halflife: newHalflife,
    lastSeen: now,
    totalExposure: (word.totalExposure || 0) + 1,
    dueDate,
    stability: calculateStability({ ...word, halflife: newHalflife }),
  };
}

/**
 * Get optimal review time for a word
 * Returns timestamp when recall probability drops below threshold
 */
export function getOptimalReviewTime(
  word: Word, 
  threshold: number = 0.85
): number {
  if (!word.lastSeen || !word.halflife) {
    return Date.now();
  }
  
  // Calculate when P(recall) will drop below threshold
  // P = 0.5^(elapsed/halflife)
  // threshold = 0.5^(elapsed/halflife)
  // elapsed = halflife * log2(1/threshold)
  const elapsed = word.halflife * Math.log2(1 / threshold);
  
  return word.lastSeen + elapsed * 60000;
}

/**
 * Calculate memory load for cognitive load management
 * Returns a score 0-100 indicating current memory burden
 */
export function calculateMemoryLoad(words: Word[]): number {
  if (words.length === 0) return 0;
  
  const now = Date.now();
  let load = 0;
  
  for (const word of words) {
    if (word.deletedAt) continue;
    
    const prob = predictRecallProbability(word, now);
    
    // Words with low recall probability contribute more to load
    // (they need more cognitive effort to maintain)
    load += (1 - prob);
    
    // New words (< 1 day) contribute extra
    if (word.createdAt && now - word.createdAt < 86400000) {
      load += 0.5;
    }
  }
  
  // Normalize to 0-100
  return Math.min(100, Math.round((load / words.length) * 100));
}

/**
 * Recommend next session size based on current memory load
 */
export function recommendSessionSize(words: Word[]): number {
  const load = calculateMemoryLoad(words);
  
  if (load > 70) return 10;   // High load: short sessions
  if (load > 50) return 20;   // Medium load
  if (load > 30) return 30;   // Low load
  return 50;                   // Very low load: can do more
}

/**
 * Forgetting curve prediction
 * Returns predicted recall probability at future time points
 */
export function predictForgettingCurve(
  word: Word, 
  hours: number = 168 // 7 days default
): { time: number; probability: number }[] {
  const now = Date.now();
  const points: { time: number; probability: number }[] = [];
  
  for (let h = 0; h <= hours; h += 4) { // Every 4 hours
    const futureTime = now + h * 3600000;
    points.push({
      time: futureTime,
      probability: predictRecallProbability(word, futureTime),
    });
  }
  
  return points;
}

// ============================================================
// Legacy exports for backward compatibility
// ============================================================
export const algorithm = {
  calculateNextReview: (word: Word) => (word.halflife || 1440) * 60000,
  calculateEaseFactor: (word: Word) => {
    const alpha = word.alpha || 1;
    const beta = word.beta || 1;
    return alpha / (alpha + beta);
  },
};

export default algorithm;
