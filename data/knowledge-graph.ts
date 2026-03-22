// 英语知识图谱 - 知识点定义
export interface KnowledgeNode {
  id: string;
  name: string;
  category: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing';
  parent?: string;  // 父知识点
  children?: string[];
  description: string;
  difficulty: number;  // 1-5
}

// 英语知识图谱
export const KNOWLEDGE_GRAPH: Record<string, KnowledgeNode> = {
  // ==================== 词汇 ====================
  'vocab_basic': {
    id: 'vocab_basic',
    name: '基础词汇',
    category: 'vocabulary',
    description: '初中基础词汇',
    difficulty: 1,
    children: ['vocab_1500', 'vocab_2000']
  },
  'vocab_1500': {
    id: 'vocab_1500',
    name: '1500词',
    category: 'vocabulary',
    parent: 'vocab_basic',
    description: '初中1500词',
    difficulty: 1
  },
  'vocab_2000': {
    id: 'vocab_2000',
    name: '2000词',
    category: 'vocabulary',
    parent: 'vocab_basic',
    description: '初中2000词',
    difficulty: 2
  },
  'vocab_3500': {
    id: 'vocab_3500',
    name: '3500词',
    category: 'vocabulary',
    description: '高中3500词',
    difficulty: 3
  },
  'vocab_cet4': {
    id: 'vocab_cet4',
    name: '四级词汇',
    category: 'vocabulary',
    description: '大学英语四级',
    difficulty: 4
  },

  // ==================== 语法 ====================
  'grammar': {
    id: 'grammar',
    name: '语法',
    category: 'grammar',
    description: '英语语法体系',
    difficulty: 2,
    children: ['grammar_tense', 'grammar_voice', 'grammar_clause', 'grammar_nonfinite']
  },
  'grammar_tense': {
    id: 'grammar_tense',
    name: '时态',
    category: 'grammar',
    parent: 'grammar',
    description: '英语时态',
    difficulty: 2,
    children: ['tense_present', 'tense_past', 'tense_future', 'tense_perfect']
  },
  'tense_present': {
    id: 'tense_present',
    name: '现在时',
    category: 'grammar',
    parent: 'grammar_tense',
    description: '现在时态',
    difficulty: 1
  },
  'tense_past': {
    id: 'tense_past',
    name: '过去时',
    category: 'grammar',
    parent: 'grammar_tense',
    description: '过去时态',
    difficulty: 2
  },
  'tense_future': {
    id: 'tense_future',
    name: '将来时',
    category: 'grammar',
    parent: 'grammar_tense',
    description: '将来时态',
    difficulty: 2
  },
  'tense_perfect': {
    id: 'tense_perfect',
    name: '完成时',
    category: 'grammar',
    parent: 'grammar_tense',
    description: '完成时态',
    difficulty: 3
  },
  'grammar_voice': {
    id: 'grammar_voice',
    name: '语态',
    category: 'grammar',
    parent: 'grammar',
    description: '主动语态与被动语态',
    difficulty: 2
  },
  'grammar_clause': {
    id: 'grammar_clause',
    name: '从句',
    category: 'grammar',
    parent: 'grammar',
    description: '名词性从句、定语从句、状语从句',
    difficulty: 3,
    children: ['clause_noun', 'clause_relative', 'clause_adverbial']
  },
  'clause_noun': {
    id: 'clause_noun',
    name: '名词性从句',
    category: 'grammar',
    parent: 'grammar_clause',
    description: '主语从句、宾语从句、表语从句、同位语从句',
    difficulty: 4
  },
  'clause_relative': {
    id: 'clause_relative',
    name: '定语从句',
    category: 'grammar',
    parent: 'grammar_clause',
    description: '关系代词、关系副词',
    difficulty: 3
  },
  'clause_adverbial': {
    id: 'clause_adverbial',
    name: '状语从句',
    category: 'grammar',
    parent: 'grammar_clause',
    description: '时间、条件、原因、结果、目的、让步等状语从句',
    difficulty: 3
  },
  'grammar_nonfinite': {
    id: 'grammar_nonfinite',
    name: '非谓语',
    category: 'grammar',
    parent: 'grammar',
    description: '不定式、分词、动名词',
    difficulty: 4,
    children: ['nonfinite_infinitive', 'nonfinite_participle', 'nonfinite_gerund']
  },
  'nonfinite_infinitive': {
    id: 'nonfinite_infinitive',
    name: '不定式',
    category: 'grammar',
    parent: 'grammar_nonfinite',
    description: 'to do 不定式',
    difficulty: 3
  },
  'nonfinite_participle': {
    id: 'nonfinite_participle',
    name: '分词',
    category: 'grammar',
    parent: 'grammar_nonfinite',
    description: '现在分词与过去分词',
    difficulty: 4
  },
  'nonfinite_gerund': {
    id: 'nonfinite_gerund',
    name: '动名词',
    category: 'grammar',
    parent: 'grammar_nonfinite',
    description: 'v.-ing 形式',
    difficulty: 3
  },

  // ==================== 阅读 ====================
  'reading': {
    id: 'reading',
    name: '阅读理解',
    category: 'reading',
    description: '阅读理解能力',
    difficulty: 2,
    children: ['reading_detail', 'reading_main', 'reading_infer', 'reading_vocab']
  },
  'reading_detail': {
    id: 'reading_detail',
    name: '细节理解',
    category: 'reading',
    parent: 'reading',
    description: '定位细节信息',
    difficulty: 2
  },
  'reading_main': {
    id: 'reading_main',
    name: '主旨大意',
    category: 'reading',
    parent: 'reading',
    description: '理解文章主旨',
    difficulty: 3
  },
  'reading_infer': {
    id: 'reading_infer',
    name: '推理判断',
    category: 'reading',
    parent: 'reading',
    description: '深层理解与推理',
    difficulty: 4
  },
  'reading_vocab': {
    id: 'reading_vocab',
    name: '词义猜测',
    category: 'reading',
    parent: 'reading',
    description: '根据上下文猜测词义',
    difficulty: 3
  },

  // ==================== 听力 ====================
  'listening': {
    id: 'listening',
    name: '听力',
    category: 'listening',
    description: '听力理解能力',
    difficulty: 2,
    children: ['listen_detail', 'listen_main', 'listen_infer']
  },
  'listen_detail': {
    id: 'listen_detail',
    name: '细节信息',
    category: 'listening',
    parent: 'listening',
    description: '听细节',
    difficulty: 2
  },
  'listen_main': {
    id: 'listen_main',
    name: '主旨大意',
    category: 'listening',
    parent: 'listening',
    description: '听主旨',
    difficulty: 3
  },
  'listen_infer': {
    id: 'listen_infer',
    name: '推理判断',
    category: 'listening',
    parent: 'listening',
    description: '听推理',
    difficulty: 4
  },

  // ==================== 写作 ====================
  'writing': {
    id: 'writing',
    name: '写作',
    category: 'writing',
    description: '英语写作能力',
    difficulty: 3,
    children: ['write_sentence', 'write_paragraph', 'write_essay']
  },
  'write_sentence': {
    id: 'write_sentence',
    name: '句子写作',
    category: 'writing',
    parent: 'writing',
    description: '造句能力',
    difficulty: 2
  },
  'write_paragraph': {
    id: 'write_paragraph',
    name: '段落写作',
    category: 'writing',
    parent: 'writing',
    description: '段落组织',
    difficulty: 3
  },
  'write_essay': {
    id: 'write_essay',
    name: '篇章写作',
    category: 'writing',
    parent: 'writing',
    description: '完整作文',
    difficulty: 4
  }
};

// 获取所有知识点
export function getAllKnowledgeNodes(): KnowledgeNode[] {
  return Object.values(KNOWLEDGE_GRAPH);
}

// 按类别获取知识点
export function getKnowledgeByCategory(category: KnowledgeNode['category']): KnowledgeNode[] {
  return Object.values(KNOWLEDGE_GRAPH).filter(k => k.category === category);
}

// 获取知识点路径（从根到叶）
export function getKnowledgePath(nodeId: string): KnowledgeNode[] {
  const path: KnowledgeNode[] = [];
  let current: KnowledgeNode | undefined = KNOWLEDGE_GRAPH[nodeId];
  
  while (current) {
    path.unshift(current);
    current = current.parent ? KNOWLEDGE_GRAPH[current.parent] : undefined;
  }
  
  return path;
}

// 能力维度定义
export const ABILITY_DIMENSIONS = [
  { id: 'vocabulary', name: '词汇', weight: 0.30, color: '#8B5CF6' },
  { id: 'grammar', name: '语法', weight: 0.25, color: '#3B82F6' },
  { id: 'reading', name: '阅读', weight: 0.25, color: '#10B981' },
  { id: 'listening', name: '听力', weight: 0.10, color: '#F59E0B' },
  { id: 'writing', name: '写作', weight: 0.10, color: '#EF4444' }
];

// 根据能力计算预测分数
export function calculatePredictedScore(levels: {
  vocabulary: number;
  grammar: number;
  reading: number;
  listening: number;
  writing: number;
}): number {
  let score = 0;
  for (const dim of ABILITY_DIMENSIONS) {
    score += levels[dim.id as keyof typeof levels] * dim.weight * 100;
  }
  return Math.round(score);
}
