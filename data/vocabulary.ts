import { Word } from '../types';
import { getBookList, getBookById, VOCABULARY_BOOKS } from './books/index';
import { GRADE8_SEM1_WORDS } from './books/grade8-sem1';
import { GRADE8_SEM2_WORDS } from './books/grade8-sem2';

// 保留原有的核心词汇作为示例
export const CORE_VOCABULARY_SAMPLE = [
  { term: "abandon", definition: "v. 放弃，遗弃", phonetic: "/ə'bændən/", exampleSentence: "He abandoned his car in the snow.", exampleTranslation: "他在雪地里抛弃了他的车。", tags: ["核心2000", "动词"] },
  { term: "ability", definition: "n. 能力，才干", phonetic: "/ə'bɪləti/", exampleSentence: "She has the ability to manage complex projects.", exampleTranslation: "她有管理复杂项目的能力。", tags: ["核心2000", "名词"] },
  { term: "abnormal", definition: "adj. 反常的，变态的", phonetic: "/æb'nɔːrml/", exampleSentence: "The weather has been abnormal this year.", exampleTranslation: "今年的天气很反常。", tags: ["核心2000", "形容词"] },
  { term: "aboard", definition: "adv. 在船(车、飞机)上", phonetic: "/ə'bɔːrd/", exampleSentence: "Welcome aboard!", exampleTranslation: "欢迎登机/船！", tags: ["核心2000", "副词"] },
  { term: "abolish", definition: "v. 废除，取消", phonetic: "/ə'bɑːlɪʃ/", exampleSentence: "Slavery was abolished in the US in 1865.", exampleTranslation: "美国于1865年废除了奴隶制。", tags: ["核心2000", "动词"] },
  { term: "abortion", definition: "n. 流产，堕胎", phonetic: "/ə'bɔːrʃn/", exampleSentence: "The issue of abortion is controversial.", exampleTranslation: "堕胎问题很有争议。", tags: ["核心2000", "名词"] },
  { term: "abrupt", definition: "adj. 突然的，唐突的", phonetic: "/ə'brʌpt/", exampleSentence: "The meeting came to an abrupt end.", exampleTranslation: "会议突然结束了。", tags: ["核心2000", "形容词"] },
  { term: "absence", definition: "n. 缺席，不在", phonetic: "/'æbsəns/", exampleSentence: "He was conspicuous by his absence.", exampleTranslation: "他因缺席而引人注目。", tags: ["核心2000", "名词"] },
  { term: "absolute", definition: "adj. 绝对的，纯粹的", phonetic: "/'æbsəluːt/", exampleSentence: "I have absolute confidence in her.", exampleTranslation: "我对她有绝对的信心。", tags: ["核心2000", "形容词"] },
  { term: "absorb", definition: "v. 吸收，吸引", phonetic: "/əb'zɔːrb/", exampleSentence: "Plants absorb carbon dioxide.", exampleTranslation: "植物吸收二氧化碳。", tags: ["核心2000", "动词"] },
];

// 获取核心词汇（保持原有接口兼容）
export const getCoreVocabulary = (): Partial<Word>[] => {
  return CORE_VOCABULARY_SAMPLE;
};

// ==================== 新增：单词书相关功能 ====================

// 获取所有可用的单词书列表
export const getVocabularyBooks = getBookList;

// 根据ID获取单词书完整数据
export const getVocabularyBookById = getBookById;

// 获取所有单词书（包含完整数据）
export const getAllVocabularyBooks = () => VOCABULARY_BOOKS;

// 获取指定单词书的所有词汇
export const getWordsFromBook = (bookId: string): Partial<Word>[] => {
  const book = getBookById(bookId);
  return book?.words || [];
};

// 获取已学习的词汇统计
export const getBookStats = (bookId: string, learnedWords: Set<string>) => {
  const book = getBookById(bookId);
  if (!book) return { total: 0, learned: 0, remaining: 0 };
  
  const learned = book.words.filter(w => learnedWords.has(w.term || '')).length;
  return {
    total: book.words.length,
    learned,
    remaining: book.words.length - learned,
  };
};
