
import { Word, InteractionMetrics } from '../types';

/**
 * 忆闪 (YiShan) 认知流算法 (Flux-v4.2)
 * 核心逻辑：基于反应时(Reaction Time)与交互摩擦力(Interaction Friction)的隐式记忆评估
 */
export const ALGO_CONFIG = {
  INSTANT_RECALL: 900,      // 极速反射阈值
  QUICK_RECALL: 2800,       // 快速回忆阈值
  DEEP_FRICTION: 7000,      // 深度思考阈值
  STABILITY_GROWTH: 2.2,    // 稳定性增长基数
  MAX_INTERVAL_MIN: 525600, // 最大间隔：1年
};

export const evaluateInteraction = (word: Word, metrics: InteractionMetrics) => {
  let currentWeight = word.weight || 0.2;
  let newWeight = currentWeight;

  // 方向逻辑：左滑=掌握(Mastered)，右滑=不熟(Review)
  if (metrics.direction === 'right') {
    // 标记为需要重学：权重降低，间隔归零
    newWeight = Math.max(0.1, currentWeight * 0.4);
    return {
      weight: newWeight,
      stability: 10, // 10分钟后再次出现
      dueDate: Date.now() + (10 * 60 * 1000)
    };
  }

  // 掌握逻辑：根据交互质量动态调整权重
  if (!metrics.isFlipped && metrics.durationMs < ALGO_CONFIG.INSTANT_RECALL) {
    // 极速掌握：完全不需要看背面，大幅提权
    newWeight = Math.min(1.0, currentWeight + 0.35);
  } else if (metrics.durationMs < ALGO_CONFIG.QUICK_RECALL) {
    // 较快掌握：权重稳定提升
    newWeight = Math.min(1.0, currentWeight + 0.2);
  } else {
    // 存在摩擦：根据是否听发音进一步微调
    let penalty = 0;
    if (metrics.audioPlayedCount > 0) penalty += 0.05;
    if (metrics.durationMs > ALGO_CONFIG.DEEP_FRICTION) penalty += 0.1;
    newWeight = Math.min(1.0, Math.max(0.2, currentWeight + 0.1 - penalty));
  }

  // 计算新的复习间隔
  let nextStability = 0;
  if (newWeight < 0.3) {
    nextStability = 30; // 30分钟
  } else if (newWeight < 0.5) {
    nextStability = 1440; // 1天
  } else {
    const base = word.stability || 1440;
    const factor = ALGO_CONFIG.STABILITY_GROWTH * (0.8 + newWeight);
    nextStability = Math.min(Math.round(base * factor), ALGO_CONFIG.MAX_INTERVAL_MIN);
  }

  return {
    weight: newWeight,
    stability: nextStability,
    dueDate: Date.now() + (nextStability * 60 * 1000)
  };
};

export const getInitialWordState = () => ({
  weight: 0.2,
  stability: 0,
  lastSeen: 0,
  totalExposure: 0,
  dueDate: Date.now(),
});
