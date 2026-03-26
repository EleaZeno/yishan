import { Word } from "../types";
import { authService } from "./auth";
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'yishan_db';
const STORE_NAME = 'words';
const API_BASE = '/api/words';

interface YiShanDB extends DBSchema {
  words: {
    key: string;
    value: Word;
    indexes: {
      'by-dueDate': number;
      'by-createdAt': number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<YiShanDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<YiShanDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-dueDate', 'dueDate');
          store.createIndex('by-createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
};

// IndexedDB Implementation (Guest Mode) - Async and scalable
const localAdapter = {
  getWords: async (): Promise<Word[]> => {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NAME, 'by-createdAt');
  },
  saveWords: async (words: Word[]): Promise<void> => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all([
      ...words.map(word => tx.store.put(word)),
      tx.done
    ]);
  },
  addWord: async (word: Word): Promise<void> => {
    const db = await getDB();
    await db.put(STORE_NAME, word);
  },
  updateWord: async (word: Word): Promise<void> => {
    const db = await getDB();
    await db.put(STORE_NAME, word);
  },
  deleteWord: async (id: string): Promise<void> => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },
  getDueWords: async (): Promise<Word[]> => {
    const db = await getDB();
    const now = Date.now();
    // Get all words and filter/sort in memory for now, 
    // or use a cursor if data gets huge.
    const words = await db.getAllFromIndex(STORE_NAME, 'by-dueDate');
    return words.filter(w => w.dueDate <= now).slice(0, 50);
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
        const all = await localAdapter.getWords();
        all.sort((a, b) => b.createdAt - a.createdAt);
        const start = (page - 1) * limit;
        return all.slice(start, start + limit);
    } else {
        return apiAdapter.fetchWithAuth(`${API_BASE}?mode=library&page=${page}&limit=${limit}`);
    }
  },

  // Study Mode: Get due words
  getDueWords: async (): Promise<Word[]> => {
    if (db.isGuestMode()) {
        return localAdapter.getDueWords();
    } else {
        return apiAdapter.fetchWithAuth(`${API_BASE}?mode=study`);
    }
  },

  addWord: async (word: Word): Promise<void> => {
    if (db.isGuestMode()) {
        await localAdapter.addWord(word);
    } else {
        await apiAdapter.fetchWithAuth(API_BASE, {
            method: 'POST',
            body: JSON.stringify(word)
        });
    }
  },

  updateWord: async (updatedWord: Word): Promise<void> => {
    if (db.isGuestMode()) {
        await localAdapter.updateWord(updatedWord);
    } else {
        await apiAdapter.fetchWithAuth(`${API_BASE}/${updatedWord.id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedWord)
        });
    }
  },

  deleteWord: async (id: string): Promise<void> => {
    if (db.isGuestMode()) {
        await localAdapter.deleteWord(id);
    } else {
        await apiAdapter.fetchWithAuth(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
    }
  },
  
  importWords: async (words: Word[]): Promise<void> => {
    if (db.isGuestMode()) {
        await localAdapter.saveWords(words);
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