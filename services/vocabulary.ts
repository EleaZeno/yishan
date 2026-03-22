import { Word } from '../types';

const API_BASE = '/api';

export interface VocabularyBook {
  id: string;
  name: string;
  name_en: string;
  description: string;
  grade: string;
  semester: string;
  word_count: number;
  difficulty: string;
}

export interface BookWithWords {
  book: VocabularyBook;
  words: Partial<Word>[];
}

/**
 * 从云端获取所有词汇书列表
 */
export async function fetchVocabularyBooks(): Promise<VocabularyBook[]> {
  try {
    const response = await fetch(`${API_BASE}/books`);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching vocabulary books:', error);
    // 降级到本地数据
    return [];
  }
}

/**
 * 从云端获取指定词汇书的所有词汇
 */
export async function fetchBookWords(bookId: string): Promise<BookWithWords | null> {
  try {
    const response = await fetch(`${API_BASE}/books/${bookId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch book words');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching book words:', error);
    return null;
  }
}

/**
 * 混合模式：优先从云端获取，失败则使用本地数据
 */
export async function getBooksWithFallback(): Promise<VocabularyBook[]> {
  const cloudBooks = await fetchVocabularyBooks();
  if (cloudBooks.length > 0) {
    return cloudBooks;
  }
  // 降级到本地 - 转换字段名
  const { getBookList } = await import('../data/books/index');
  const localBooks = getBookList();
  return localBooks.map(b => ({
    id: b.id,
    name: b.name,
    name_en: b.nameEn,
    description: b.description,
    grade: b.grade,
    semester: b.semester,
    word_count: b.wordCount,
    difficulty: b.difficulty
  }));
}

/**
 * 混合模式：优先从云端获取词汇，失败则使用本地数据
 */
export async function getBookWordsWithFallback(bookId: string): Promise<Partial<Word>[]> {
  const result = await fetchBookWords(bookId);
  if (result && result.words.length > 0) {
    return result.words;
  }
  // 降级到本地
  const { getWordsFromBook } = await import('../data/vocabulary');
  return getWordsFromBook(bookId);
}