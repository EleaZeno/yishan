import { Word, InteractionMetrics } from '../types';

/**
 * 忆闪 (YiShan) 记忆算法核心
 * 
 * 模型：Behavior-Weighted Strength Model
 * 公式：Strength = Sigmoid(Weights * Features)
 */

// 1. 特征权重配置 (可调整参数)
const W = {
  direction_right: 3.5,   // 记住 (基准分)
  direction_left: -4.0,   // 忘记 (惩罚极重)
  time_penalty: -0.8,     // 时间惩罚系数 (对数级)
  flip_penalty: -1.5,     // 翻面惩罚 (看了答案说明不熟)
  hint_penalty: -0.5,     // 提示惩罚 (听音/看例句)
  history_inertia: 0.5,   // 历史强度惯性
};

const DAY_IN_MINUTES = 24 * 60;

/**
 * Sigmoid 激活函数
 * 将任意分数映射到 0-1 区间
 */
const sigmoid = (z: number): number => {
  return 1 / (1 + Math.exp(-z));
};

/**
 * 计算记忆强度
 * @param word 当前单词对象
 * @param metrics 用户本次交互行为数据
 */
export const calculateStrength = (word: Word, metrics: InteractionMetrics): number => {
  // 1. 方向基准分
  let score = metrics.direction === 'right' ? W.direction_right : W.direction_left;

  // 2. 时间惩罚 (对数衰减)
  // 如果是秒杀 (<1.5s)，惩罚极小；如果是 10s，惩罚显著
  // 使用 Math.log(seconds + 1) 保证非负
  const seconds = Math.max(0.1, metrics.durationMs / 1000);
  const timeLog = Math.log(seconds + 0.5); 
  // 只有在"记得"的时候才计算时间惩罚，"忘记"本来就是负分
  if (metrics.direction === 'right') {
      score += W.time_penalty * timeLog;
  }

  // 3. 行为惩罚
  if (metrics.flipped) score += W.flip_penalty;
  if (metrics.audioPlayed > 0 || metrics.exampleExpanded) score += W.hint_penalty;

  // 4. 历史惯性
  // 保持之前的强度对当前有一定影响，防止单次误操作导致剧烈波动
  score += W.history_inertia * (word.strength || 0);

  // 5. 归一化输出
  return sigmoid(score);
};

/**
 * 规划下次复习时间
 * @param strength 当前计算出的记忆强度 (0-1)
 * @param currentInterval 上一次的间隔 (分钟)
 */
export const scheduleNextReview = (strength: number, currentInterval: number) => {
  let nextIntervalMinutes = 0;

  if (strength < 0.25) {
    // 遗忘/极难 -> 放入短期队列 (1-5分钟)
    nextIntervalMinutes = 2; 
  } else if (strength < 0.55) {
    // 困难 -> 30分钟后
    nextIntervalMinutes = 30;
  } else if (strength < 0.75) {
    // 一般 -> 12小时 (隔夜)
    nextIntervalMinutes = 12 * 60;
  } else if (strength < 0.90) {
    // 熟练 -> 3天
    nextIntervalMinutes = 3 * DAY_IN_MINUTES;
  } else {
    // 大师 -> 指数增长
    const base = currentInterval > 0 ? currentInterval : 24 * 60;
    // 强度越高，乘数越大 (2.0 ~ 3.5 倍)
    const multiplier = 2.0 + (strength * 1.5); 
    nextIntervalMinutes = Math.round(base * multiplier);
  }

  // 边界保护
  if (nextIntervalMinutes < 1) nextIntervalMinutes = 1;

  const now = Date.now();
  const dueDate = now + (nextIntervalMinutes * 60 * 1000);

  return {
    strength,
    interval: nextIntervalMinutes,
    dueDate,
    repetitions: strength > 0.3 ? 1 : 0 // 简单逻辑更新
  };
};

export const getInitialWordState = () => ({
  strength: 0,
  interval: 0,
  repetitions: 0,
  dueDate: Date.now(),
});
