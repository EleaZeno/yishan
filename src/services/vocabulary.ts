import { VOCAB_DATA } from '../data/vocab-data';

const API_BASE = 'https://yishan-api.15703377328.workers.dev';

export interface VocabularyBook {
  id: string;
  name: string;
  name_en: string;
  description: string;
  word_count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  grade: string;
  semester?: string;
  exam_type?: string;
}

export interface BookWord {
  id: string;
  term: string;       // 统一用 term，与 Word 类型一致
  definition: string;
  phonetic?: string;
  exampleSentence?: string;
  tags?: string[];
}

const LOCAL_BOOKS: VocabularyBook[] = [
  { id: 'level1', name: '小学基础', name_en: 'Primary School',      description: '小学阶段必备基础词汇，约500词',   word_count: 15,  difficulty: 'easy',   grade: '小学' },
  { id: 'level2', name: '初中基础', name_en: 'Junior High Basic',   description: '初中阶段基础词汇，约1000词',      word_count: 15,  difficulty: 'easy',   grade: '初中', semester: '初一' },
  { id: 'level3', name: '初中进阶', name_en: 'Junior High Advanced', description: '初中进阶词汇，约1500词',         word_count: 15,  difficulty: 'medium', grade: '初中', semester: '初三' },
  { id: 'level4', name: '高中基础', name_en: 'Senior High Basic',   description: '高中基础词汇，约2500词',          word_count: 15,  difficulty: 'medium', grade: '高中', semester: '高一' },
  { id: 'level5', name: '高中进阶', name_en: 'Senior High Advanced', description: '高中进阶词汇，约3500词',         word_count: 15,  difficulty: 'medium', grade: '高中', semester: '高三' },
  { id: 'level6', name: '四六级',   name_en: 'CET-4/6',             description: '大学英语四六级核心词汇',          word_count: 15,  difficulty: 'hard',   grade: '大学', exam_type: 'CET' },
  { id: 'level7', name: '考研词汇', name_en: 'Graduate Entrance',   description: '考研英语核心词汇',                word_count: 15,  difficulty: 'hard',   grade: '研究生', exam_type: 'GRE' },
  { id: 'level8', name: '雅思托福', name_en: 'IELTS/TOEFL',         description: '雅思托福高频词汇',                word_count: 15,  difficulty: 'hard',   grade: '出国', exam_type: 'IELTS' },
  { id: 'all',    name: '全部词汇', name_en: 'All Vocabulary',       description: '所有级别词汇合集',                word_count: 136, difficulty: 'medium', grade: '全部' },
];

// 立即返回本地数据，后台尝试 API（不阻塞 UI）
export async function getBooksWithFallback(): Promise<VocabularyBook[]> {
  // 直接返回本地数据，不等 API
  return LOCAL_BOOKS;
}

// 立即返回本地数据，后台尝试 API（不阻塞 UI）
export async function getBookWordsWithFallback(bookId: string): Promise<BookWord[]> {
  // 直接用本地 vocab-data，零延迟
  let filtered = VOCAB_DATA;
  if (bookId !== 'all') {
    const level = parseInt(bookId.replace('level', ''));
    if (!isNaN(level)) {
      filtered = VOCAB_DATA.filter(v => v.level === level);
    }
  }

  return filtered.map((v, i) => ({
    id: `${bookId}_${i}_${v.word}`,
    term: v.word,                          // 统一用 term
    definition: `${v.pos} ${v.translation}`,
    phonetic: undefined,
    exampleSentence: undefined,
    tags: [bookId],
  }));
}

export default { getBooksWithFallback, getBookWordsWithFallback };
