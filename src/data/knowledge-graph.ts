export interface KnowledgeNode {
  id: string;
  name: string;
  level: number;
  prerequisites: string[];
  description?: string;
  category: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing';
  difficulty: number;
}

export const KNOWLEDGE_GRAPH: Record<string, KnowledgeNode> = {
  // Vocabulary
  'vocab_basic': { id: 'vocab_basic', name: '基础词汇', level: 1, prerequisites: [], category: 'vocabulary', difficulty: 0.2 },
  'vocab_intermediate': { id: 'vocab_intermediate', name: '进阶词汇', level: 2, prerequisites: ['vocab_basic'], category: 'vocabulary', difficulty: 0.5 },
  'vocab_advanced': { id: 'vocab_advanced', name: '高级词汇', level: 3, prerequisites: ['vocab_intermediate'], category: 'vocabulary', difficulty: 0.8 },
  'vocab_1500': { id: 'vocab_1500', name: '1500词汇', level: 1, prerequisites: [], category: 'vocabulary', difficulty: 0.3 },
  'vocab_2000': { id: 'vocab_2000', name: '2000词汇', level: 2, prerequisites: ['vocab_1500'], category: 'vocabulary', difficulty: 0.4 },
  'vocab_3500': { id: 'vocab_3500', name: '3500词汇', level: 2, prerequisites: ['vocab_2000'], category: 'vocabulary', difficulty: 0.5 },
  'vocab_cet4': { id: 'vocab_cet4', name: '四级词汇', level: 3, prerequisites: ['vocab_3500'], category: 'vocabulary', difficulty: 0.7 },

  // Grammar
  'grammar_basic': { id: 'grammar_basic', name: '基础语法', level: 1, prerequisites: [], category: 'grammar', difficulty: 0.3 },
  'grammar_intermediate': { id: 'grammar_intermediate', name: '进阶语法', level: 2, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.6 },
  'tense_present': { id: 'tense_present', name: '现在时态', level: 1, prerequisites: [], category: 'grammar', difficulty: 0.3 },
  'tense_past': { id: 'tense_past', name: '过去时态', level: 1, prerequisites: [], category: 'grammar', difficulty: 0.3 },
  'tense_future': { id: 'tense_future', name: '将来时态', level: 1, prerequisites: [], category: 'grammar', difficulty: 0.4 },
  'tense_perfect': { id: 'tense_perfect', name: '完成时态', level: 2, prerequisites: ['tense_present', 'tense_past'], category: 'grammar', difficulty: 0.5 },
  'grammar_voice': { id: 'grammar_voice', name: '被动语态', level: 2, prerequisites: ['tense_present', 'tense_past'], category: 'grammar', difficulty: 0.5 },
  'clause_relative': { id: 'clause_relative', name: '定语从句', level: 2, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.6 },
  'clause_noun': { id: 'clause_noun', name: '名词性从句', level: 3, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.7 },
  'clause_adverbial': { id: 'clause_adverbial', name: '状语从句', level: 2, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.5 },
  'nonfinite_infinitive': { id: 'nonfinite_infinitive', name: '不定式', level: 2, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.6 },
  'nonfinite_participle': { id: 'nonfinite_participle', name: '分词', level: 3, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.7 },
  'nonfinite_gerund': { id: 'nonfinite_gerund', name: '动名词', level: 2, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.6 },
  'grammar_modal': { id: 'grammar_modal', name: '情态动词', level: 1, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.4 },
  'grammar_subjunctive': { id: 'grammar_subjunctive', name: '虚拟语气', level: 3, prerequisites: ['grammar_intermediate'], category: 'grammar', difficulty: 0.8 },
  'grammar_preposition': { id: 'grammar_preposition', name: '介词', level: 1, prerequisites: ['grammar_basic'], category: 'grammar', difficulty: 0.3 },

  // Reading
  'reading_basic': { id: 'reading_basic', name: '基础阅读', level: 1, prerequisites: ['vocab_basic'], category: 'reading', difficulty: 0.4 },
  'reading_advanced': { id: 'reading_advanced', name: '高级阅读', level: 3, prerequisites: ['vocab_intermediate', 'grammar_intermediate'], category: 'reading', difficulty: 0.7 },
  'reading_detail': { id: 'reading_detail', name: '细节理解', level: 1, prerequisites: ['vocab_basic'], category: 'reading', difficulty: 0.4 },
  'reading_main': { id: 'reading_main', name: '主旨大意', level: 2, prerequisites: ['reading_detail'], category: 'reading', difficulty: 0.5 },
  'reading_infer': { id: 'reading_infer', name: '推理判断', level: 3, prerequisites: ['reading_detail', 'reading_main'], category: 'reading', difficulty: 0.6 },
  'reading_vocab': { id: 'reading_vocab', name: '词义猜测', level: 2, prerequisites: ['vocab_basic'], category: 'reading', difficulty: 0.5 },

  // Listening
  'listening_basic': { id: 'listening_basic', name: '基础听力', level: 1, prerequisites: [], category: 'listening', difficulty: 0.4 },
  'listen_detail': { id: 'listen_detail', name: '听力细节', level: 1, prerequisites: [], category: 'listening', difficulty: 0.4 },
  'listen_main': { id: 'listen_main', name: '听力主旨', level: 2, prerequisites: ['listen_detail'], category: 'listening', difficulty: 0.5 },
  'listen_infer': { id: 'listen_infer', name: '听力推理', level: 3, prerequisites: ['listen_detail'], category: 'listening', difficulty: 0.6 },

  // Writing
  'writing_basic': { id: 'writing_basic', name: '基础写作', level: 1, prerequisites: ['grammar_basic'], category: 'writing', difficulty: 0.5 },
  'write_sentence': { id: 'write_sentence', name: '句子翻译', level: 1, prerequisites: ['grammar_basic', 'vocab_basic'], category: 'writing', difficulty: 0.4 },
  'write_paragraph': { id: 'write_paragraph', name: '段落写作', level: 2, prerequisites: ['write_sentence'], category: 'writing', difficulty: 0.6 },
  'write_essay': { id: 'write_essay', name: '篇章写作', level: 3, prerequisites: ['write_paragraph'], category: 'writing', difficulty: 0.7 },
};

export default KNOWLEDGE_GRAPH;
