
import { Word, InteractionMetrics } from '../types';

/**
 * 忆闪 (YiShan) 贝叶斯自适应算法 (Flux-v5 Bayesian)
 * 核心：使用 Beta 分布动态更新记忆半衰期
 */
const CONFIG = {
  RECALL_THRESHOLD: 0.85,    // 当召回率低于此值时，标记为“到期”
  DEFAULT_HALFLIFE: 24 * 60, // 初始半衰期：1天 (分钟)
  MIN_HALFLIFE: 10,          // 最小半衰期：10分钟
  MAX_HALFLIFE: 525600,      // 最大半衰期：1年
  REACTION_BONUS_MAX: 0.2,   // 快速反应给予的额外权重增益
};

/**
 * 计算在给定时间间隔后的召回概率
 * P(recall) = 2^(-Δt / halflife)
 */
export const predictRecallProbability = (word: Word, now: number): number => {
  if (word.lastSeen === 0) return 0;
  const elapsed = (now - word.lastSeen) / (1000 * 60); // 分钟
  return Math.pow(2, -elapsed / (word.halflife || CONFIG.DEFAULT_HALFLIFE));
};

/**
 * 贝叶斯后验更新
 */
export const evaluateInteraction = (word: Word, metrics: InteractionMetrics) => {
  const now = Date.now();
  const isSuccess = metrics.direction === 'left';
  
  // 1. 获取当前参数
  let { alpha, beta, halflife } = word;
  const elapsed = word.lastSeen === 0 ? 0 : (now - word.lastSeen) / (1000 * 60);

  // 2. 更新 alpha/beta (简化版共轭先验更新)
  // 如果成功，alpha 增加；如果失败，beta 增加
  if (isSuccess) {
    // 反应时奖惩：反应越快，alpha 增益越高
    const reactionFactor = Math.max(0, 1 - metrics.durationMs / 3000);
    alpha += 1 + reactionFactor * CONFIG.REACTION_BONUS_MAX;
    
    // 半衰期动态调整
    // 如果在快遗忘时想起来了，半衰期大幅增长；如果在刚记住时想起来，半衰期小幅增长
    const scalingFactor = 1 + (alpha / (alpha + beta)) * 1.5;
    halflife = Math.min(CONFIG.MAX_HALFLIFE, halflife * scalingFactor);
  } else {
    beta += 1;
    // 失败后半衰期剧减
    halflife = Math.max(CONFIG.MIN_HALFLIFE, halflife * 0.2);
    // 重置部分权重，使其更频繁出现
    alpha = Math.max(2, alpha * 0.5);
  }

  // 3. 计算下次复习时间
  // 根据 P(recall) = 0.85 倒推所需时间 Δt
  // Δt = -halflife * log2(0.85)
  const nextInterval = Math.round(halflife * 0.234); // -log2(0.85) ≈ 0.234
  
  return {
    alpha,
    beta,
    halflife,
    dueDate: now + nextInterval * 60 * 1000
  };
};

export const getInitialWordState = () => ({
  alpha: 3,       // 初始成功先验
  beta: 1,        // 初始失败先验
  halflife: CONFIG.DEFAULT_HALFLIFE,
  lastSeen: 0,
  totalExposure: 0,
  dueDate: Date.now(),
});
