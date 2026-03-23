export interface KnowledgeNode {
  id: string;
  name: string;
  connections: string[];
  category?: string;
  difficulty?: number;
}

export const KNOWLEDGE_GRAPH: KnowledgeNode[] = [
  { id: '0', name: '璇嶆眹', connections: ['1', '2', '3', '4'], category: 'vocabulary' },
  { id: '1', name: 'CET-4璇嶆眹', connections: ['0', '2'], category: 'vocabulary', difficulty: 1 },
  { id: '2', name: 'CET-6璇嶆眹', connections: ['0', '1'], category: 'vocabulary', difficulty: 2 },
  { id: '3', name: '鍩虹璇硶', connections: ['0', '4'], category: 'grammar', difficulty: 1 },
  { id: '4', name: '楂樼骇璇硶', connections: ['0', '3'], category: 'grammar', difficulty: 2 },
];

export const knowledgeGraph = KNOWLEDGE_GRAPH;

export default KNOWLEDGE_GRAPH;
