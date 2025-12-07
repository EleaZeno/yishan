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
    
    try {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            authService.logout();
            window.location.reload();
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            throw new Error('API Request Failed');
        }
        
        return response.json();
    } catch (e) {
        console.error("API Error", e);
        throw e;
    }
  }
};

export const db = {
  isGuestMode: () => !authService.getToken(),

  // Get All Words
  getAllWords: async (): Promise<Word[]> => {
    if (db.isGuestMode()) {
        return localAdapter.getWords().sort((a, b) => b.createdAt - a.createdAt);
    } else {
        try {
            const res = await apiAdapter.fetchWithAuth(API_BASE);
            return res.sort((a: Word, b: Word) => b.createdAt - a.createdAt);
        } catch (e) {
            // Fallback to local if network fails, or just return empty/error depending on UX policy
            // For now, let's allow read-only fallback if desired, or re-throw.
            // Throwing ensures user knows they are offline.
            throw e;
        }
    }
  },

  // Get Due Words
  getDueWords: async (): Promise<Word[]> => {
    const words = await db.getAllWords();
    const now = Date.now();
    return words.filter(w => w.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
  },

  // Add Word
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

  // Update Word
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

  // Delete Word
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
  
  // Import (Not fully implemented on API side for batch)
  importWords: async (words: Word[]): Promise<void> => {
    if (db.isGuestMode()) {
        const existing = localAdapter.getWords();
        const newBatch = [...existing, ...words];
        localAdapter.saveWords(newBatch);
    } else {
        // Implement batch API call if needed
        for (const w of words) {
            await db.addWord(w);
        }
    }
  }
};