import { Word } from '../types';

export interface CoreVocabItem {
  id: string;
  term: string;
  phonetic?: string;
  definition: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  tags: string[];
}

const CORE_VOCAB: CoreVocabItem[] = [
  { id: 'v1', term: 'abandon', phonetic: '/əˈbændən/', definition: 'v. to give up completely', exampleSentence: 'She had to abandon her plan.', tags: ['cet4', 'gaokao'] },
  { id: 'v2', term: 'ability', phonetic: '/əˈbɪləti/', definition: 'n. the power or skill to do something', exampleSentence: 'She has the ability to learn quickly.', tags: ['cet4', 'gaokao'] },
  { id: 'v3', term: 'absorb', phonetic: '/əbˈzɔːb/', definition: 'v. to take in or soak up', exampleSentence: 'Plants absorb sunlight.', tags: ['cet4'] },
  { id: 'v4', term: 'achieve', phonetic: '/əˈtʃiːv/', definition: 'v. to successfully reach a goal', exampleSentence: 'She achieved her dream.', tags: ['cet4', 'gaokao'] },
  { id: 'v5', term: 'adapt', phonetic: '/əˈdæpt/', definition: 'v. to adjust to new conditions', exampleSentence: 'Animals adapt to their environment.', tags: ['cet4'] },
];

export function getCoreVocabulary(): CoreVocabItem[] {
  return CORE_VOCAB;
}

export default CORE_VOCAB;
