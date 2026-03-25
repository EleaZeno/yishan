import { Word } from '../types';

const DB_NAME = 'yishan_db';
const STORE_NAME = 'words';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('term', 'term', { unique: false });
        store.createIndex('dueDate', 'dueDate', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

export const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
};

export const db = {
  getLibraryWords: async (page: number = 1, pageSize: number = 20): Promise<Word[]> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const allWords = request.result as Word[];
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          resolve(allWords.slice(start, end));
        };
      });
    } catch (e) {
      console.error('getLibraryWords error:', e);
      return [];
    }
  },

  getDueWords: async (): Promise<Word[]> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('dueDate');
        const range = IDBKeyRange.upperBound(Date.now());
        const request = index.getAll(range);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          resolve(request.result as Word[]);
        };
      });
    } catch (e) {
      console.error('getDueWords error:', e);
      return [];
    }
  },

  importWords: async (words: Word[]): Promise<void> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        words.forEach(word => {
          store.put(word);  // put = upsert，避免重复导入报错
        });
        
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    } catch (e) {
      console.error('importWords error:', e);
    }
  },

  addWord: async (word: Word): Promise<void> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(word);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error('addWord error:', e);
    }
  },

  updateWord: async (id: string, data: Partial<Word>): Promise<void> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const word = getRequest.result as Word;
          const updated = { ...word, ...data };
          const putRequest = store.put(updated);
          
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (e) {
      console.error('updateWord error:', e);
    }
  },

  deleteWord: async (id: string): Promise<void> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error('deleteWord error:', e);
    }
  },

  getAllWordsForStats: async (): Promise<Word[]> => {
    try {
      const database = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          resolve(request.result as Word[]);
        };
      });
    } catch (e) {
      console.error('getAllWordsForStats error:', e);
      return [];
    }
  },

  query: async () => [],
  execute: async () => {},
};

export default storage;
