/**
 * 学业评估服务 (Local Storage Implementation)
 */

import { KNOWLEDGE_GRAPH } from '../data/knowledge-graph';

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

const STORAGE_KEY_MODEL = 'yishan_student_model';
const STORAGE_KEY_MASTERY = 'yishan_knowledge_mastery';

const DEFAULT_MODEL: StudentAbility = {
  vocabulary: 0.5,
  grammar: 0.5,
  reading: 0.5,
  listening: 0.5,
  writing: 0.5,
  overall: 0.5,
  predictedScore: 50,
  totalTests: 0,
  lastUpdated: Date.now()
};

function getLocalModel(): StudentAbility {
  const data = localStorage.getItem(STORAGE_KEY_MODEL);
  return data ? JSON.parse(data) : { ...DEFAULT_MODEL };
}

function saveLocalModel(model: StudentAbility) {
  model.lastUpdated = Date.now();
  model.predictedScore = calculatePredictedScore(model);
  model.overall = (model.vocabulary + model.grammar + model.reading + model.listening + model.writing) / 5;
  localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(model));
}

function getLocalMastery(): Record<string, number> {
  const data = localStorage.getItem(STORAGE_KEY_MASTERY);
  return data ? JSON.parse(data) : {};
}

function saveLocalMastery(mastery: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY_MASTERY, JSON.stringify(mastery));
}

/**
 * 词汇量评估
 */
export async function assessVocabulary(
  correctCount: number,
  totalCount: number,
  userId?: string
): Promise<VocabTestResult | null> {
  const rate = correctCount / totalCount;
  let level = 0.3;
  if (rate >= 0.9) level = 0.9;
  else if (rate >= 0.75) level = 0.8;
  else if (rate >= 0.6) level = 0.7;
  else if (rate >= 0.5) level = 0.6;
  else if (rate >= 0.4) level = 0.5;

  const model = getLocalModel();
  model.vocabulary = (model.vocabulary + level) / 2; // Simple moving average
  model.totalTests = (model.totalTests || 0) + 1;
  saveLocalModel(model);

  return {
    testId: Date.now().toString(),
    level,
    name: getAbilityLevel(level * 100),
    estimatedWords: Math.round(level * 5000)
  };
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
  const masteryMap = getLocalMastery();
  let currentMastery = masteryMap[knowledgeId] || priorMastery;
  
  // Simple Bayesian-like update
  const learningRate = 0.2;
  if (isCorrect) {
    currentMastery = currentMastery + (1 - currentMastery) * learningRate;
  } else {
    currentMastery = currentMastery - currentMastery * learningRate;
  }
  
  masteryMap[knowledgeId] = currentMastery;
  saveLocalMastery(masteryMap);

  // Update overall dimension based on knowledge category
  const node = KNOWLEDGE_GRAPH[knowledgeId];
  if (node && node.category) {
    const model = getLocalModel();
    const dim = node.category as keyof StudentAbility;
    if (typeof model[dim] === 'number') {
      model[dim] = (model[dim] as number + currentMastery) / 2;
      saveLocalModel(model);
    }
  }

  return currentMastery;
}

/**
 * 综合能力评估
 */
export async function assessAbility(
  responses: any[],
  userId?: string
): Promise<{ abilities: StudentAbility; predictedScore: number; suggestions: string[] } | null> {
  const model = getLocalModel();
  return {
    abilities: model,
    predictedScore: model.predictedScore || 50,
    suggestions: ['继续保持练习', '针对薄弱点进行专项训练']
  };
}

/**
 * 获取学生能力模型
 */
export async function getStudentModel(userId?: string): Promise<StudentAbility | null> {
  return getLocalModel();
}

/**
 * 获取薄弱点
 */
export async function getWeakPoints(userId?: string): Promise<KnowledgeMastery[]> {
  const masteryMap = getLocalMastery();
  const weakPoints: KnowledgeMastery[] = [];
  
  for (const [knowledgeId, mastery] of Object.entries(masteryMap)) {
    if (mastery < 0.6) {
      const node = KNOWLEDGE_GRAPH[knowledgeId];
      if (node) {
        weakPoints.push({
          knowledgeId,
          name: node.name,
          mastery,
          category: node.category,
          difficulty: node.difficulty
        });
      }
    }
  }
  
  return weakPoints.sort((a, b) => a.mastery - b.mastery);
}

/**
 * 获取推荐学习内容
 */
export async function getRecommendations(userId?: string): Promise<KnowledgeMastery[]> {
  return getWeakPoints(userId);
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
