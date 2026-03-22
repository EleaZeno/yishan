/**
 * AI 学业评估引擎
 * 包含：项目反应理论(IRT)、贝叶斯知识追踪(BKT)、自适应测试
 */

import { KNOWLEDGE_GRAPH, ABILITY_DIMENSIONS, calculatePredictedScore, type KnowledgeNode } from '../data/knowledge-graph';

// ==================== 类型定义 ====================

export interface Question {
  id: string;
  type: 'vocab' | 'grammar' | 'reading' | 'listening';
  difficulty: number;  // 0-1
  knowledgePoints: string[];
  content: string;
  options: string[];
  answer: number;  // 正确选项索引
  explanation: string;
}

export interface TestResponse {
  questionId: string;
  isCorrect: boolean;
  responseTime: number;  // ms
  timestamp: number;
}

export interface StudentAbility {
  vocabulary: number;
  grammar: number;
  reading: number;
  listening: number;
  writing: number;
  overall: number;
}

export interface KnowledgeMastery {
  knowledgeId: string;
  masteryLevel: number;  // 0-1
  attempts: number;
  correctCount: number;
}

export interface VocabTestResult {
  testId: string;
  testType: string;
  totalWords: number;
  correctCount: number;
  estimatedLevel: number;  // 词汇量
  completedAt: number;
}

// ==================== 项目反应理论 (IRT) ====================

/**
 * IRT 模型 - 计算学生能力值
 * 使用 3PL 模型 (Three-Parameter Logistic)
 * P(正确) = c + (1-c) / (1 + e^(-a(θ-b)))
 * a: 区分度, b: 难度, c: 猜测概率
 */
export class IRTEngine {
  private abilities: Record<string, number> = {};
  private questionParams: Map<string, { a: number; b: number; c: number }> = new Map();

  constructor() {
    // 默认参数
  }

  /**
   * 计算答对概率
   */
  probabilityCorrect(ability: number, difficulty: number, discrimination: number = 1, guessing: number = 0.25): number {
    const exponent = -discrimination * (ability - difficulty);
    const probability = guessing + (1 - guessing) / (1 + Math.exp(exponent));
    return probability;
  }

  /**
   * 根据答题历史估算能力值
   * 使用最大似然估计 (MLE)
   */
  estimateAbility(responses: TestResponse[], questions: Question[]): number {
    if (responses.length === 0) return 0.5;

    let ability = 0;  // 初始猜测

    // 迭代优化 (牛顿法简化版)
    for (let iter = 0; iter < 20; iter++) {
      let info = 0;
      let score = 0;

      for (const response of responses) {
        const q = questions.find(q => q.id === response.questionId);
        if (!q) continue;

        const p = this.probabilityCorrect(ability, q.difficulty);
        const indicator = response.isCorrect ? 1 : 0;

        // 信息量 (Fisher Information)
        const a = 1;
        const info_i = a * a * (p - 0.25) * (p - 0.25) / (p * (1 - p));
        info += info_i;

        // 得分偏差
        score += (indicator - p) * 1;
      }

      if (info < 0.0001) break;

      // 更新能力值
      ability += score / info * 0.5;

      // 限制范围
      ability = Math.max(-4, Math.min(4, ability));
    }

    // 归一化到 0-1
    return (ability + 4) / 8;
  }

  /**
   * 选择下一道最合适的题目
   * 使用最大信息量原则
   */
  selectNextQuestion(
    questions: Question[],
    currentAbility: number,
    answeredIds: Set<string>
  ): Question | null {
    const unanswered = questions.filter(q => !answeredIds.has(q.id));
    if (unanswered.length === 0) return null;

    let bestQuestion = unanswered[0];
    let maxInfo = -1;

    for (const q of unanswered) {
      const p = this.probabilityCorrect(currentAbility, q.difficulty);
      const a = 1;
      const info = a * a * (p - 0.25) * (p - 0.25) / (p * (1 - p));
      
      if (info > maxInfo) {
        maxInfo = info;
        bestQuestion = q;
      }
    }

    return bestQuestion;
  }
}

// ==================== 贝叶斯知识追踪 (BKT) ====================

/**
 * BKT 模型 - 追踪知识点掌握程度
 */
export class BKTEngine {
  // 默认参数 (可学习调整)
  private learnRate = 0.1;   // 学习率
  private guessRate = 0.25;  // 猜测率
  private slipRate = 0.1;   // 失误率

  /**
   * 初始化知识点掌握度
   */
  initMastery(initialKnowledge: number = 0.2): number {
    return initialKnowledge;
  }

  /**
   * 更新知识点掌握度
   * @param prior 先验掌握概率
   * @param isCorrect 是否答对
   * @returns 后验掌握概率
   */
  updateMastery(prior: number, isCorrect: boolean): number {
    // 计算先验预测正确概率
    const pCorrect = prior * (1 - this.slipRate) + (1 - prior) * this.guessRate;
    
    // 后验掌握概率 (贝叶斯更新)
    let posterior: number;
    
    if (isCorrect) {
      // 答对了：提高掌握度
      posterior = (prior * (1 - this.slipRate)) / pCorrect;
    } else {
      // 答错了：降低掌握度
      posterior = (prior * this.slipRate) / pCorrect;
    }

    // 应用学习率
    if (isCorrect) {
      posterior = posterior + this.learnRate * (1 - posterior);
    }

    // 限制范围
    return Math.max(0, Math.min(1, posterior));
  }

  /**
   * 预测下次答对概率
   */
  predictCorrect(mastery: number): number {
    return mastery * (1 - this.slipRate) + (1 - mastery) * this.guessRate;
  }
}

// ==================== 自适应测试引擎 ====================

export class AdaptiveTestEngine {
  private irt: IRTEngine;
  private bkt: BKTEngine;
  private questionPool: Question[] = [];
  private userResponses: TestResponse[] = [];
  private answeredIds: Set<string> = new Set();
  private currentAbility: number = 0.5;

  constructor(questions: Question[]) {
    this.irt = new IRTEngine();
    this.bkt = new BKTEngine();
    this.questionPool = questions;
  }

  /**
   * 开始测试
   */
  start(): Question | null {
    // 选择中等难度的题目开始
    const startQuestion = this.questionPool.find(q => 
      q.difficulty >= 0.4 && q.difficulty <= 0.6
    );
    return startQuestion || this.questionPool[0];
  }

  /**
   * 回答问题
   */
  answer(questionId: string, isCorrect: boolean, responseTime: number): { 
    nextQuestion: Question | null; 
    estimatedAbility: number;
    progress: number;
  } {
    this.userResponses.push({
      questionId,
      isCorrect,
      responseTime,
      timestamp: Date.now()
    });
    this.answeredIds.add(questionId);

    // 更新能力估计
    this.currentAbility = this.irt.estimateAbility(
      this.userResponses, 
      this.questionPool
    );

    // 选择下一题
    const nextQuestion = this.irt.selectNextQuestion(
      this.questionPool,
      this.currentAbility,
      this.answeredIds
    );

    return {
      nextQuestion,
      estimatedAbility: this.currentAbility,
      progress: this.answeredIds.size / this.questionPool.length
    };
  }

  /**
   * 获取当前能力估计
   */
  getCurrentAbility(): number {
    return this.currentAbility;
  }

  /**
   * 是否完成测试
   */
  isComplete(): boolean {
    return this.answeredIds.size >= this.questionPool.length;
  }

  /**
   * 获取测试结果
   */
  getResult(): {
    ability: number;
    correctRate: number;
    totalQuestions: number;
    answeredCount: number;
  } {
    const correct = this.userResponses.filter(r => r.isCorrect).length;
    return {
      ability: this.currentAbility,
      correctRate: correct / this.userResponses.length,
      totalQuestions: this.questionPool.length,
      answeredCount: this.userResponses.length
    };
  }
}

// ==================== 词汇量评估 ====================

/**
 * 词汇量测试引擎
 */
export class VocabAssessmentEngine {
  // 词汇级别定义
  private vocabLevels = [
    { level: 0.1, name: '小学', minWords: 500, maxWords: 1000 },
    { level: 0.2, name: '初中基础', minWords: 1000, maxWords: 1500 },
    { level: 0.3, name: '初中进阶', minWords: 1500, maxWords: 2000 },
    { level: 0.4, name: '高中基础', minWords: 2000, maxWords: 2500 },
    { level: 0.5, name: '高中进阶', minWords: 2500, maxWords: 3500 },
    { level: 0.6, name: '四级', minWords: 3500, maxWords: 4500 },
    { level: 0.7, name: '六级', minWords: 4500, maxWords: 6000 },
    { level: 0.8, name: '雅思', minWords: 6000, maxWords: 8000 },
    { level: 0.9, name: '托福', minWords: 8000, maxWords: 10000 },
    { level: 1.0, name: 'GRE', minWords: 10000, maxWords: 20000 }
  ];

  /**
   * 根据正确率估算词汇量
   */
  estimateVocabLevel(correctRate: number): { level: number; name: string; estimatedWords: number } {
    // 使用自适应算法估算
    let low = 0;
    let high = this.vocabLevels.length - 1;
    
    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2);
      const threshold = 1 - mid * 0.1;  // 难度阈值
      
      if (correctRate >= threshold) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }

    const vocabInfo = this.vocabLevels[low];
    
    // 根据具体正确率计算词汇量
    const baseWords = vocabInfo.minWords;
    const range = vocabInfo.maxWords - vocabInfo.minWords;
    const extraWords = Math.floor(range * correctRate);
    
    return {
      level: vocabInfo.level,
      name: vocabInfo.name,
      estimatedWords: Math.min(baseWords + extraWords, vocabInfo.maxWords)
    };
  }

  /**
   * 选择下一个测试词
   */
  selectNextWord(
    answeredWords: Set<string>,
    difficulty: number
  ): { word: string; definition: string; difficulty: number } | null {
    // 从词库中选词（简化版）
    // 实际应从 D1 数据库获取
    return null;
  }
}

// ==================== 能力综合评估 ====================

/**
 * 综合能力评估引擎
 */
export class AbilityAssessmentEngine {
  private irt: IRTEngine;
  private bkt: BKTEngine;

  constructor() {
    this.irt = new IRTEngine();
    this.bkt = new BKTEngine();
  }

  /**
   * 评估综合能力
   */
  assess(
    responsesByType: Record<string, TestResponse[]>,
    questionsByType: Record<string, Question[]>
  ): StudentAbility {
    const abilities: StudentAbility = {
      vocabulary: 0.5,
      grammar: 0.5,
      reading: 0.5,
      listening: 0.5,
      writing: 0.5,
      overall: 0.5
    };

    let totalWeight = 0;

    for (const [type, responses] of Object.entries(responsesByType)) {
      const questions = questionsByType[type] || [];
      if (questions.length === 0) continue;

      const ability = this.irt.estimateAbility(responses, questions);
      
      switch (type) {
        case 'vocab':
          abilities.vocabulary = ability;
          totalWeight += 0.30;
          break;
        case 'grammar':
          abilities.grammar = ability;
          totalWeight += 0.25;
          break;
        case 'reading':
          abilities.reading = ability;
          totalWeight += 0.25;
          break;
        case 'listening':
          abilities.listening = ability;
          totalWeight += 0.10;
          break;
        case 'writing':
          abilities.writing = ability;
          totalWeight += 0.10;
          break;
      }
    }

    // 计算综合能力
    if (totalWeight > 0) {
      abilities.overall = 
        (abilities.vocabulary * 0.30 +
        abilities.grammar * 0.25 +
        abilities.reading * 0.25 +
        abilities.listening * 0.10 +
        abilities.writing * 0.10) / totalWeight;
    }

    return abilities;
  }

  /**
   * 计算预测分数
   */
  predictScore(abilities: StudentAbility): number {
    return calculatePredictedScore({
      vocabulary: abilities.vocabulary,
      grammar: abilities.grammar,
      reading: abilities.reading,
      listening: abilities.listening,
      writing: abilities.writing
    });
  }

  /**
   * 识别薄弱点
   */
  identifyWeakPoints(
    knowledgeMastery: KnowledgeMastery[],
    threshold: number = 0.5
  ): { knowledgeId: string; name: string; mastery: number }[] {
    return knowledgeMastery
      .filter(k => k.masteryLevel < threshold)
      .map(k => ({
        knowledgeId: k.knowledgeId,
        name: KNOWLEDGE_GRAPH[k.knowledgeId]?.name || k.knowledgeId,
        mastery: k.masteryLevel
      }))
      .sort((a, b) => a.mastery - b.mastery);
  }

  /**
   * 生成学习建议
   */
  generateSuggestions(abilities: StudentAbility): string[] {
    const suggestions: string[] = [];

    if (abilities.vocabulary < 0.5) {
      suggestions.push('词汇量是英语学习的基础，建议每天背诵20个新单词');
    }
    if (abilities.grammar < 0.5) {
      suggestions.push('语法较弱，建议系统学习从句和非谓语动词');
    }
    if (abilities.reading < 0.5) {
      suggestions.push('阅读理解需要多读英文文章，练习定位细节和推理判断');
    }
    if (abilities.listening < 0.5) {
      suggestions.push('听力需要多听，可以尝试听写训练');
    }
    if (abilities.writing < 0.5) {
      suggestions.push('写作需要多练习，建议背诵范文和常用句型');
    }

    if (suggestions.length === 0) {
      suggestions.push('你的英语能力很强！建议挑战更高难度的内容');
    }

    return suggestions;
  }
}

// 导出单例
export const irtEngine = new IRTEngine();
export const bktEngine = new BKTEngine();
export const abilityEngine = new AbilityAssessmentEngine();
export const vocabEngine = new VocabAssessmentEngine();
