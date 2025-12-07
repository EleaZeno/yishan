import { Grade, Word } from '../types';
import { DEFAULT_EASINESS, DEFAULT_INTERVAL, DEFAULT_REPETITIONS, DAY_IN_MS } from '../constants';

/**
 * SuperMemo-2 算法实现
 * @param word 当前单词对象
 * @param grade 用户评分 (0-5)
 * @returns 更新后的单词字段 (easiness, interval, repetitions, dueDate)
 */
export const calculateReview = (word: Word, grade: Grade) => {
  let { easiness, interval, repetitions } = word;

  if (grade >= 3) {
    // 正确回忆
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
    repetitions += 1;
  } else {
    // 忘记了
    repetitions = 0;
    interval = 1;
  }

  // 更新易度因子 EF
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easiness = easiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  
  // EF 不得低于 1.3
  if (easiness < 1.3) {
    easiness = 1.3;
  }

  const now = Date.now();
  const dueDate = now + (interval * DAY_IN_MS);

  return {
    easiness,
    interval,
    repetitions,
    dueDate,
    lastReviewDate: now,
  };
};

export const getInitialWordState = () => ({
  easiness: DEFAULT_EASINESS,
  interval: DEFAULT_INTERVAL,
  repetitions: DEFAULT_REPETITIONS,
  dueDate: Date.now(),
});
