import { Word } from "../types";

// 注意：在真实的 Cloudflare D1 架构中，这里应该调用 `fetch('/api/words', ...)`
// 为了确保 Demo 立即可用，我们使用 LocalStorage 模拟数据库行为。

const STORAGE_KEY = 'yishan_words_v1';

const getWords = (): Word[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveWords = (words: Word[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
};

export const db = {
  // 获取所有单词
  getAllWords: async (): Promise<Word[]> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 100)); 
    return getWords().sort((a, b) => b.createdAt - a.createdAt);
  },

  // 获取今日待复习单词
  getDueWords: async (): Promise<Word[]> => {
    const words = getWords();
    const now = Date.now();
    return words.filter(w => w.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
  },

  // 添加新单词
  addWord: async (word: Word): Promise<void> => {
    const words = getWords();
    words.push(word);
    saveWords(words);
  },

  // 更新单词
  updateWord: async (updatedWord: Word): Promise<void> => {
    const words = getWords();
    const index = words.findIndex(w => w.id === updatedWord.id);
    if (index !== -1) {
      words[index] = updatedWord;
      saveWords(words);
    }
  },

  // 删除单词
  deleteWord: async (id: string): Promise<void> => {
    const words = getWords();
    const newWords = words.filter(w => w.id !== id);
    saveWords(newWords);
  },
  
  // 批量导入 (Simulated)
  importWords: async (words: Word[]): Promise<void> => {
    const existing = getWords();
    const newBatch = [...existing, ...words];
    saveWords(newBatch);
  }
};
