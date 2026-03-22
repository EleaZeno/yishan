/**
 * 学业评估服务
 */

const API_BASE = '/api';

export interface StudentAbility {
  vocabulary: number;
  grammar: number;
  reading: number;
  listening: number;
  writing: number;
  overall: number;
  predictedScore?: number;
  totalTests?: number;
  lastUpdated?: number;
}

export interface KnowledgeMastery {
  knowledgeId: string;
  name: string;
  mastery: number;
  category: string;
  difficulty?: number;
}

export interface VocabTestResult {
  testId: string;
  level: number;
  name: string;
  estimatedWords: number;
}

/**
 * 词汇量评估
 */
export async function assessVocabulary(
  correctCount: number,
  totalCount: number,
  userId?: string
): Promise<VocabTestResult | null> {
  try {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assess_vocab',
        userId,
        data: { correctCount, totalCount }
      })
    });
    if (!response.ok) throw new Error('Assessment failed');
    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error('Vocab assessment error:', error);
    return null;
  }
}

/**
 * 更新知识点掌握度
 */
export async function updateKnowledgeMastery(
  knowledgeId: string,
  isCorrect: boolean,
  priorMastery: number = 0.2,
  userId?: string
): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_mastery',
        userId,
        data: { knowledgeId, isCorrect, priorMastery }
      })
    });
    if (!response.ok) throw new Error('Update failed');
    const result = await response.json();
    return result.mastery;
  } catch (error) {
    console.error('Mastery update error:', error);
    return null;
  }
}

/**
 * 综合能力评估
 */
export async function assessAbility(
  responses: any[],
  userId?: string
): Promise<{ abilities: StudentAbility; predictedScore: number; suggestions: string[] } | null> {
  try {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assess_ability',
        userId,
        data: { responses }
      })
    });
    if (!response.ok) throw new Error('Assessment failed');
    return await response.json();
  } catch (error) {
    console.error('Ability assessment error:', error);
    return null;
  }
}

/**
 * 获取学生能力模型
 */
export async function getStudentModel(userId?: string): Promise<StudentAbility | null> {
  try {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_model',
        userId
      })
    });
    if (!response.ok) throw new Error('Failed to get model');
    return await response.json();
  } catch (error) {
    console.error('Get model error:', error);
    return null;
  }
}

/**
 * 获取薄弱点
 */
export async function getWeakPoints(userId?: string): Promise<KnowledgeMastery[]> {
  try {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_weak_points',
        userId
      })
    });
    if (!response.ok) throw new Error('Failed to get weak points');
    const result = await response.json();
    return result.weakPoints || [];
  } catch (error) {
    console.error('Get weak points error:', error);
    return [];
  }
}

/**
 * 获取推荐学习内容
 */
export async function getRecommendations(userId?: string): Promise<KnowledgeMastery[]> {
  try {
    const response = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_recommendations',
        userId
      })
    });
    if (!response.ok) throw new Error('Failed to get recommendations');
    const result = await response.json();
    return result.recommendations || [];
  } catch (error) {
    console.error('Get recommendations error:', error);
    return [];
  }
}

/**
 * 能力维度定义
 */
export const ABILITY_DIMENSIONS = [
  { id: 'vocabulary', name: '词汇', shortName: '词', weight: 0.30, color: '#8B5CF6' },
  { id: 'grammar', name: '语法', shortName: '语', weight: 0.25, color: '#3B82F6' },
  { id: 'reading', name: '阅读', shortName: '读', weight: 0.25, color: '#10B981' },
  { id: 'listening', name: '听力', shortName: '听', weight: 0.10, color: '#F59E0B' },
  { id: 'writing', name: '写作', shortName: '写', weight: 0.10, color: '#EF4444' }
];

/**
 * 获取维度颜色
 */
export function getDimensionColor(dimensionId: string): string {
  const dim = ABILITY_DIMENSIONS.find(d => d.id === dimensionId);
  return dim?.color || '#6B7280';
}

/**
 * 获取维度名称
 */
export function getDimensionName(dimensionId: string): string {
  const dim = ABILITY_DIMENSIONS.find(d => d.id === dimensionId);
  return dim?.name || dimensionId;
}

/**
 * 计算预测分数
 */
export function calculatePredictedScore(abilities: StudentAbility): number {
  let score = 0;
  for (const dim of ABILITY_DIMENSIONS) {
    const value = abilities[dim.id as keyof typeof abilities];
    if (value !== undefined && dim.weight !== undefined) {
      score += value * dim.weight * 100;
    }
  }
  return Math.round(score);
}

/**
 * 获取能力等级标签
 */
export function getAbilityLevel(score: number): string {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '待提升';
}

/**
 * 获取能力进度颜色
 */
export function getProgressColor(value: number): string {
  if (value >= 0.8) return '#10B981'; // 绿色
  if (value >= 0.6) return '#3B82F6'; // 蓝色
  if (value >= 0.4) return '#F59E0B'; // 黄色
  return '#EF4444'; // 红色
}
