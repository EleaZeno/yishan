export interface KnowledgeNode {
  id: string;
  name: string;
  level: number;
  prerequisites: string[];
  description?: string;
}

export const KNOWLEDGE_GRAPH: Record<string, KnowledgeNode> = {
  'vocab_basic': { id: 'vocab_basic', name: 'Basic Vocabulary', level: 1, prerequisites: [] },
  'vocab_intermediate': { id: 'vocab_intermediate', name: 'Intermediate Vocabulary', level: 2, prerequisites: ['vocab_basic'] },
  'vocab_advanced': { id: 'vocab_advanced', name: 'Advanced Vocabulary', level: 3, prerequisites: ['vocab_intermediate'] },
  'grammar_basic': { id: 'grammar_basic', name: 'Basic Grammar', level: 1, prerequisites: [] },
  'grammar_intermediate': { id: 'grammar_intermediate', name: 'Intermediate Grammar', level: 2, prerequisites: ['grammar_basic'] },
  'reading_basic': { id: 'reading_basic', name: 'Basic Reading', level: 1, prerequisites: ['vocab_basic'] },
  'reading_advanced': { id: 'reading_advanced', name: 'Advanced Reading', level: 3, prerequisites: ['vocab_intermediate', 'grammar_intermediate'] },
  'listening_basic': { id: 'listening_basic', name: 'Basic Listening', level: 1, prerequisites: [] },
  'writing_basic': { id: 'writing_basic', name: 'Basic Writing', level: 1, prerequisites: ['grammar_basic'] },
};

export default KNOWLEDGE_GRAPH;
