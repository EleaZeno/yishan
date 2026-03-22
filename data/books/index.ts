import { Word } from '../../types';
import { GRADE8_SEM1_WORDS } from './grade8-sem1';
import { GRADE8_SEM2_WORDS } from './grade8-sem2';

/**
 * 单词书元数据
 */
export interface VocabularyBook {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  grade: string;
  semester: string;
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  words: Partial<Word>[];
}

/**
 * 可用的单词书列表
 */
export const VOCABULARY_BOOKS: VocabularyBook[] = [
  {
    id: 'grade8-sem1',
    name: '初二上学期',
    nameEn: 'Grade 8 Semester 1',
    description: '初二年级上学期英语词汇表，包含人教版教材同步词汇',
    grade: '初二',
    semester: '上学期',
    wordCount: GRADE8_SEM1_WORDS.length,
    difficulty: 'medium',
    words: GRADE8_SEM1_WORDS,
  },
  {
    id: 'grade8-sem2',
    name: '初二下学期',
    nameEn: 'Grade 8 Semester 2',
    description: '初二年级下学期英语词汇表，包含人教版教材同步词汇',
    grade: '初二',
    semester: '下学期',
    wordCount: GRADE8_SEM2_WORDS.length,
    difficulty: 'medium',
    words: GRADE8_SEM2_WORDS,
  },
];

/**
 * 获取所有单词书列表（不含words数据，用于列表展示）
 */
export const getBookList = () => {
  return VOCABULARY_BOOKS.map(book => ({
    id: book.id,
    name: book.name,
    nameEn: book.nameEn,
    description: book.description,
    grade: book.grade,
    semester: book.semester,
    wordCount: book.wordCount,
    difficulty: book.difficulty,
  }));
};

/**
 * 根据ID获取单词书
 */
export const getBookById = (id: string): VocabularyBook | undefined => {
  return VOCABULARY_BOOKS.find(book => book.id === id);
};

/**
 * 获取指定年级的单词书
 */
export const getBooksByGrade = (grade: string): VocabularyBook[] => {
  return VOCABULARY_BOOKS.filter(book => book.grade === grade);
};
