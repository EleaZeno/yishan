export interface VocabularyBook {
  id: string;
  name: string;
  wordCount: number;
}

const BOOKS: VocabularyBook[] = [
  { id: '1', name: 'CET-4', wordCount: 4000 },
  { id: '2', name: 'CET-6', wordCount: 2000 },
  { id: '3', name: 'IELTS', wordCount: 5000 },
  { id: '4', name: 'TOEFL', wordCount: 8000 },
];

export async function getBooksWithFallback(): Promise<VocabularyBook[]> {
  return BOOKS;
}

export async function getBookWordsWithFallback(bookId: string): Promise<any[]> {
  return [];
}

export default { getBooksWithFallback, getBookWordsWithFallback };
