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
  estimatedVocab: number,
  userId?: string
): Promise<VocabTestResult | null> {
  // 假设最大词汇量为 12000
  const MAX_VOCAB = 12000;
  let level = estimatedVocab / MAX_VOCAB;
  if (level > 1) level = 1;
  if (level < 0.1) level = 0.1;

  const model = getLocalModel();
  model.vocabulary = (model.vocabulary * 0.3) + (level * 0.7); // Give more weight to the new test
  model.totalTests = (model.totalTests || 0) + 1;
  saveLocalModel(model);

  return {
    testId: Date.now().toString(),
    level,
    name: getAbilityLevel(level * 100),
    estimatedWords: estimatedVocab
  };
}

/**
 * 更新知识点掌握度 (使用贝叶斯知识追踪 BKT 算法)
 */
export async function updateKnowledgeMastery(
  knowledgeId: string,
  isCorrect: boolean,
  priorMastery: number = 0.5,
  userId?: string
): Promise<number | null> {
  const masteryMap = getLocalMastery();
  let currentMastery = masteryMap[knowledgeId] || priorMastery;
  
  // BKT (Bayesian Knowledge Tracing) Parameters
  const P_T = 0.1;  // Probability of transition (learning the skill)
  const P_G = 0.25; // Probability of guess (assuming 4 options)
  const P_S = 0.1;  // Probability of slip (careless mistake)

  let pL_obs = 0; // P(L | observation)

  if (isCorrect) {
    // P(L | Correct) = [P(L) * (1 - P(S))] / [P(L) * (1 - P(S)) + (1 - P(L)) * P(G)]
    const numerator = currentMastery * (1 - P_S);
    const denominator = numerator + (1 - currentMastery) * P_G;
    pL_obs = numerator / denominator;
  } else {
    // P(L | Incorrect) = [P(L) * P(S)] / [P(L) * P(S) + (1 - P(L)) * (1 - P(G))]
    const numerator = currentMastery * P_S;
    const denominator = numerator + (1 - currentMastery) * (1 - P_G);
    pL_obs = numerator / denominator;
  }
  
  // Apply learning transition: P(L_new) = P(L|obs) + (1 - P(L|obs)) * P(T)
  currentMastery = pL_obs + (1 - pL_obs) * P_T;
  
  // Clamp values to prevent absolute 0 or 1 which breaks Bayesian updates
  currentMastery = Math.max(0.01, Math.min(0.99, currentMastery));
  
  masteryMap[knowledgeId] = currentMastery;
  saveLocalMastery(masteryMap);

  // Update overall dimension based on knowledge category
  const node = KNOWLEDGE_GRAPH[knowledgeId];
  if (node && node.category) {
    const model = getLocalModel();
    const dim = node.category as keyof StudentAbility;
    
    // Recalculate dimension score based on all knowledge points in this category
    let totalMastery = 0;
    let count = 0;
    
    // 遍历所有知识点，计算该分类下的总掌握度
    for (const [id, n] of Object.entries(KNOWLEDGE_GRAPH)) {
      if (n.category === dim) {
        const m = masteryMap[id] || 0.5; // 默认掌握度为 0.5
        totalMastery += m;
        count++;
      }
    }
    
    if (count > 0) {
      // Blend with previous score to maintain some stability, but heavily weight the new average
      const newDimScore = totalMastery / count;
      if (typeof model[dim] === 'number') {
        model[dim] = (model[dim] as number * 0.3) + (newDimScore * 0.7);
      } else {
        model[dim] = newDimScore;
      }
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
 * 重置评估数据
 */
export async function resetAssessment(userId?: string): Promise<void> {
  localStorage.removeItem(STORAGE_KEY_MODEL);
  localStorage.removeItem(STORAGE_KEY_MASTERY);
}

/**
 * 终身学习考试体系定义
 */
export const EXAM_TYPES = [
  { id: 'primary', name: '小学毕业', maxScore: 100, baseScore: 0, targetAbility: 0.15, unit: '分', desc: '词汇量约800' },
  { id: 'zhongkao', name: '中考', maxScore: 120, baseScore: 0, targetAbility: 0.30, unit: '分', desc: '词汇量约2000' },
  { id: 'gaokao', name: '高考', maxScore: 150, baseScore: 0, targetAbility: 0.45, unit: '分', desc: '词汇量约3500' },
  { id: 'cet4', name: '大学四级', maxScore: 710, baseScore: 220, targetAbility: 0.60, unit: '分', desc: '词汇量约4500' },
  { id: 'cet6', name: '大学六级', maxScore: 710, baseScore: 220, targetAbility: 0.75, unit: '分', desc: '词汇量约6000' },
  { id: 'ielts', name: '雅思 (IELTS)', maxScore: 9.0, baseScore: 0, targetAbility: 0.85, unit: '分', desc: '词汇量约8000' },
  { id: 'toefl', name: '托福 (TOEFL)', maxScore: 120, baseScore: 0, targetAbility: 0.85, unit: '分', desc: '词汇量约8000' },
  { id: 'gre', name: 'GRE (Verbal)', maxScore: 170, baseScore: 130, targetAbility: 0.95, unit: '分', desc: '词汇量12000+' },
];

/**
 * 预测特定考试的分数
 * @param overallAbility 综合能力值 (0-1)
 * @param examId 考试ID
 */
export function predictExamScore(overallAbility: number, examId: string): string {
  const exam = EXAM_TYPES.find(e => e.id === examId);
  if (!exam) return '0';

  if (overallAbility >= exam.targetAbility) {
    return exam.id === 'ielts' ? exam.maxScore.toFixed(1) : exam.maxScore.toString();
  }

  // 采用非线性映射，前期提分快，后期提分慢
  const ratio = Math.pow(overallAbility / exam.targetAbility, 0.8);
  let score = exam.baseScore + (exam.maxScore - exam.baseScore) * ratio;

  if (exam.id === 'ielts') {
    // 雅思按 0.5 分递进
    return (Math.round(score * 2) / 2).toFixed(1);
  }

  return Math.round(score).toString();
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

