import { describe, it, expect } from 'vitest';
import { getInitialWordState, predictRecallProbability } from '../lib/algorithm';

describe('Algorithm', () => {
  it('should initialize word state correctly', () => {
    const state = getInitialWordState();
    expect(state).toHaveProperty('alpha');
    expect(state).toHaveProperty('beta');
    expect(state).toHaveProperty('halflife');
    expect(state).toHaveProperty('dueDate');
  });

  it('should predict recall probability', () => {
    const word = {
      id: 'test',
      term: 'test',
      definition: 'test',
      alpha: 0.5,
      beta: 0.5,
      halflife: 1440,
      dueDate: Date.now(),
      lastSeen: Date.now(),
      totalExposure: 1,
      tags: [],
      createdAt: Date.now(),
    };

    const probability = predictRecallProbability(word, Date.now());
    expect(probability).toBeGreaterThanOrEqual(0);
    expect(probability).toBeLessThanOrEqual(1);
  });
});
