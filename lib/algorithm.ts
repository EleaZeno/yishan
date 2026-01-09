
import { Word, InteractionMetrics } from '../types';

/**
 * 忆闪 (YiShan) 隐式交互算法 (Flux-v4)
 * 逻辑：通过用户与卡片的“摩擦力”推断掌握程度
 */
export const ALGO_CONFIG = {
  // 关键时间阈值 (ms)
  INSTANT_RECALL: 800,      // 极速反射（甚至不需要看背面）
  QUICK_RECALL: 2500,       // 快速回忆
  LONG_FRICTION: 6000,      // 深度思考/查阅

  // 稳定性扩张因子
  STABILITY_BASE: 2.1,
  MAX_STABILITY: 525600,     // 1年上限
};

export const evaluateInteraction = (word: Word, metrics: InteractionMetrics) => {
  let currentWeight = word.weight || 0.2;
  let newWeight = currentWeight;

  // 如果是左滑（视为未掌握或需要再次确认）
  if (metrics.direction === 'left') {
    newWeight = Math.max(0.1, currentWeight * 0.5); // 显著降低权重
    return scheduleNextExposure(newWeight, word.stability * 0.2); // 大幅缩短复习周期
  }

  // 如果是右滑（视为掌握，通过交互深度判断掌握质量）
  
  // 情况 A：极速反射 (未翻面且时间极短)
  if (!metrics.isFlipped && metrics.durationMs < ALGO_CONFIG.INSTANT_RECALL) {
    newWeight = Math.min(1.0, currentWeight + 0.3);
  } 
  // 情况 B：快速回忆 (翻面了但通过很快)
  else if (metrics.isFlipped && metrics.durationMs < ALGO_CONFIG.QUICK_RECALL && metrics.audioPlayedCount === 0) {
    newWeight = Math.min(1.0, currentWeight + 0.2);
  }
  // 情况 C：有摩擦的回忆 (翻面了，甚至听了发音)
  else if (metrics.isFlipped) {
    let penalty = 0;
    if (metrics.audioPlayedCount > 0) penalty += 0.05; // 听发音说明不够熟练
    if (metrics.durationMs > ALGO_CONFIG.LONG_FRICTION) penalty += 0.1; // 思考太久
    
    newWeight = Math.min(1.0, Math.max(0.1, currentWeight + 0.1 - penalty));
  }
  // 情况 D：未翻面但停留很久（可能是走神，也可能是犹豫）
  else {
    newWeight = Math.max(0.1, currentWeight - 0.05);
  }

  return scheduleNextExposure(newWeight, word.stability);
};

export const scheduleNextExposure = (weight: number, currentStability: number) => {
  let nextIntervalMin = 0;
  
  if (weight < 0.2) {
    nextIntervalMin = 10; // 10分钟后重现
  } else if (weight < 0.4) {
    nextIntervalMin = 120; // 2小时后
  } else if (weight < 0.6) {
    nextIntervalMin = 1440; // 1天
  } else {
    const base = currentStability > 0 ? currentStability : 1440;
    // 权重越高，稳定性增长越快
    const expansionFactor = ALGO_CONFIG.STABILITY_BASE * (0.7 + weight);
    nextIntervalMin = Math.min(Math.round(base * expansionFactor), ALGO_CONFIG.MAX_STABILITY);
  }

  return {
    weight,
    stability: nextIntervalMin,
    dueDate: Date.now() + (nextIntervalMin * 60 * 1000)
  };
};

export const getInitialWordState = () => ({
  weight: 0.2,
  stability: 0,
  lastSeen: 0,
  totalExposure: 0,
  dueDate: Date.now(),
});
