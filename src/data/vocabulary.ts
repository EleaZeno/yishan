export interface VocabItem {
  term: string;
  definition: string;
  tags?: string[];
}

export const CORE_VOCABULARY: VocabItem[] = [
  { term: 'abandon', definition: 'to leave somebody/something behind', tags: ['CET-4'] },
  { term: 'ability', definition: 'the fact that somebody/something is able to do something', tags: ['CET-4'] },
  { term: 'able', definition: 'having the power, skill, means, or opportunity to do something', tags: ['CET-4'] },
  { term: 'about', definition: 'on the subject of; concerning', tags: ['CET-4'] },
  { term: 'above', definition: 'in or to a higher position', tags: ['CET-4'] },
];

export function getCoreVocabulary(): VocabItem[] {
  return CORE_VOCABULARY;
}

export const vocabulary = CORE_VOCABULARY;
export default vocabulary;
