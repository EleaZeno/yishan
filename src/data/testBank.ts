import { VOCAB_DATA } from './vocab-data';

export interface TestQuestion {
  word: string;
  options: string[];
  correct: number;
  translation: string;
}

export const VOCAB_TEST_BANK: TestQuestion[] = VOCAB_DATA.slice(0, 50).map((item, index) => {
  const allTranslations = VOCAB_DATA.map(v => v.translation);
  const shuffled = allTranslations.sort(() => Math.random() - 0.5);
  const options = [
    item.translation,
    ...shuffled.filter(t => t !== item.translation).slice(0, 3)
  ].sort(() => Math.random() - 0.5);
  
  return {
    word: item.word,
    options,
    correct: options.indexOf(item.translation),
    translation: item.translation,
  };
});
