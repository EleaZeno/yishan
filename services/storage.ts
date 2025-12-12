import { Word } from "../types";
import { authService } from "./auth";

const STORAGE_KEY = 'yishan_words_v1';
const API_BASE = '/api/words';

// LocalStorage Implementation (Guest Mode) - Memory intensive but fast for small data
const localAdapter = {
  getWords: (): Word[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveWords: (words: Word[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }
};

const apiAdapter = {
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            authService.logout();
            window.location.reload();
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error('API Request Failed');
        return response.json();
    } catch (e) {
        console.error("API Error", e);
        throw e;
    }
  }
};

export const db = {
  isGuestMode: () => !authService.getToken(),

  // Get Stats (Uses full fetch for now, optimized endpoint recommended for future)
  getStatsData: async (): Promise<Word[]> => {
    if (db.isGuestMode()) return localAdapter.getWords();
    // For cloud stats, we might need a dedicated endpoint, but for now fetch library page 1 
    // This is a trade-off. Correct way: GET /api/stats. 
    // Fallback: Fetch due words to show something useful.
    return db.getDueWords(); 
  },

  // Library Mode: Pagination
  getLibraryWords: async (page: number = 1, limit: number = 20): Promise<Word[]> => {
    if (db.isGuestMode()) {
        const all = localAdapter.getWords().sort((a, b) => b.createdAt - a.createdAt);
        const start = (page - 1) * limit;
        return all.slice(start, start + limit);
    } else {
        return apiAdapter.fetchWithAuth(`${API_BASE}?mode=library&page=${page}&limit=${limit}`);
    }
  },

  // Study Mode: Get due words
  getDueWords: async (): Promise<Word[]> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        const now = Date.now();
        return words.filter(w => w.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate).slice(0, 50);
    } else {
        return apiAdapter.fetchWithAuth(`${API_BASE}?mode=study`);
    }
  },

  addWord: async (word: Word): Promise<void> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        words.push(word);
        localAdapter.saveWords(words);
    } else {
        await apiAdapter.fetchWithAuth(API_BASE, {
            method: 'POST',
            body: JSON.stringify(word)
        });
    }
  },

  updateWord: async (updatedWord: Word): Promise<void> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        const index = words.findIndex(w => w.id === updatedWord.id);
        if (index !== -1) {
            words[index] = updatedWord;
            localAdapter.saveWords(words);
        }
    } else {
        await apiAdapter.fetchWithAuth(`${API_BASE}/${updatedWord.id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedWord)
        });
    }
  },

  deleteWord: async (id: string): Promise<void> => {
    if (db.isGuestMode()) {
        const words = localAdapter.getWords();
        const newWords = words.filter(w => w.id !== id);
        localAdapter.saveWords(newWords);
    } else {
        await apiAdapter.fetchWithAuth(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
    }
  },
  
  importWords: async (words: Word[]): Promise<void> => {
    if (db.isGuestMode()) {
        const existing = localAdapter.getWords();
        const newBatch = [...existing, ...words];
        localAdapter.saveWords(newBatch);
    } else {
        await apiAdapter.fetchWithAuth(`${API_BASE}/batch`, {
            method: 'POST',
            body: JSON.stringify(words)
        });
    }
  },

  // Helper for dashboard charts (Guest only full scan, Cloud needs optimization)
  getAllWordsForStats: async (): Promise<Word[]> => {
     if(db.isGuestMode()) return localAdapter.getWords();
     // Caution: This is heavy. Only use for small accounts or implement /api/stats
     // Assuming limit 1000 for stats visualization for now
     return apiAdapter.fetchWithAuth(`${API_BASE}?mode=library&limit=1000`); 
  }
};