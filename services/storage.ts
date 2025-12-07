import { Word } from "../types";
import { authService } from "./auth";

const STORAGE_KEY = 'yishan_words_v1';
const API_BASE = '/api/words';

// LocalStorage Implementation (Guest Mode)
const localAdapter = {
  getWords: (): Word[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveWords: (words: Word[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }
};

// API Implementation (Cloud Mode)
const apiAdapter = {
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    // 模拟模式：如果在演示环境且没有真实后端，使用本地存储模拟 API 延迟
    if (process.env.NODE_ENV === 'development' && !window.location.host.includes('pages.dev')) {
         await new Promise(r => setTimeout(r, 300));
         return null; // Signal to fallback or mock
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        if (response.status === 401) {
            authService.logout();
            window.location.reload();
        }
        throw new Error('API Request Failed');
    }
    return response.json();
  }
};

export const db = {
  isGuestMode: () => !authService.getToken(),

  // 获取所有单词
  getAllWords: async (): Promise<Word[]> => {
    if (db.isGuestMode()) {
        await new Promise(r => setTimeout(r, 100));
        return localAdapter.getWords().sort((a, b) => b.createdAt - a.createdAt);
    } else {
        try {
            const res = await apiAdapter.fetchWithAuth(API_BASE);
            // Fallback for demo if API fails/doesn't exist yet
            if (res === null) return localAdapter.getWords(); 
            return res.sort((a: Word, b: Word) => b.createdAt - a.createdAt);
        } catch (e) {
            console.warn("Cloud fetch failed, using local", e);
            return localAdapter.getWords();
        }
    }
  },

  // 获取今日待复习单词
  getDueWords: async (): Promise<Word[]> => {
    // 这里为了简化，我们在前端过滤。真实 D1 可以后端过滤: /api/words?due=true
    const words = await db.getAllWords();
    const now = Date.now();
    return words.filter(w => w.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
  },

  // 添加新单词
  addWord: async (word: Word): Promise<void> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        words.push(word);
        localAdapter.saveWords(words);
    } else {
        try {
            const res = await apiAdapter.fetchWithAuth(API_BASE, {
                method: 'POST',
                body: JSON.stringify(word)
            });
            if (res === null) { // Demo fallback
                 const words = localAdapter.getWords();
                 words.push(word);
                 localAdapter.saveWords(words);
            }
        } catch (e) {
            console.error("Cloud save failed", e);
            // Optimistic update logic could go here
        }
    }
  },

  // 更新单词
  updateWord: async (updatedWord: Word): Promise<void> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        const index = words.findIndex(w => w.id === updatedWord.id);
        if (index !== -1) {
            words[index] = updatedWord;
            localAdapter.saveWords(words);
        }
    } else {
         try {
            const res = await apiAdapter.fetchWithAuth(`${API_BASE}/${updatedWord.id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedWord)
            });
             if (res === null) { // Demo fallback
                const words = localAdapter.getWords();
                const index = words.findIndex(w => w.id === updatedWord.id);
                if (index !== -1) {
                    words[index] = updatedWord;
                    localAdapter.saveWords(words);
                }
            }
        } catch (e) {
            console.error("Cloud update failed", e);
        }
    }
  },

  // 删除单词
  deleteWord: async (id: string): Promise<void> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        const newWords = words.filter(w => w.id !== id);
        localAdapter.saveWords(newWords);
    } else {
        try {
            const res = await apiAdapter.fetchWithAuth(`${API_BASE}/${id}`, {
                method: 'DELETE',
            });
             if (res === null) { // Demo fallback
                 const words = localAdapter.getWords();
                 const newWords = words.filter(w => w.id !== id);
                 localAdapter.saveWords(newWords);
            }
        } catch (e) {
             console.error("Cloud delete failed", e);
        }
    }
  },
  
  // 批量导入
  importWords: async (words: Word[]): Promise<void> => {
    if (db.isGuestMode()) {
        const existing = localAdapter.getWords();
        const newBatch = [...existing, ...words];
        localAdapter.saveWords(newBatch);
    } else {
         // Batch API implementation would go here
    }
  }
};