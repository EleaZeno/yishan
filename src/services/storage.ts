// ============================================================
// yishan Storage v2.0 - Local-first with Cloud Sync
// 
// Architecture:
// - Primary: IndexedDB (always available, offline-first)
// - Sync: Cloudflare Workers + D1 (when online)
// - Strategy: Optimistic local updates + background sync
// ============================================================

import { Word, SyncStatus, SyncChange } from '../types';
import { authService } from './auth';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'yishan_db_v2';
const STORE_NAME = 'words';
const SYNC_STORE = 'sync_meta';

interface YiShanDB extends DBSchema {
  words: {
    key: string;
    value: Word;
    indexes: {
      'by-dueDate': number;
      'by-createdAt': number;
      'by-contentType': string;
    };
  };
  sync_meta: {
    key: string;
    value: {
      deviceId: string;
      lastSyncAt: number;
      syncVersion: number;
      pendingChanges: number;
    };
  };
}

// Get or create DB
let dbPromise: Promise<IDBPDatabase<YiShanDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<YiShanDB>(DB_NAME, 2, {
      upgrade(db, oldVersion) {
        // Create or migrate words store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-dueDate', 'dueDate');
          store.createIndex('by-createdAt', 'createdAt');
          store.createIndex('by-contentType', 'contentType');
        }
        // Create sync metadata store
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: 'deviceId' });
        }
      },
    });
  }
  return dbPromise;
};

// Generate unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('yishan_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('yishan_device_id', deviceId);
  }
  return deviceId;
};

// ============================================================
// IndexedDB Operations (Local-first)
// ============================================================
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
    const words = await db.getAllFromIndex(STORE_NAME, 'by-dueDate');
    return words.filter(w => w.dueDate <= now && !w.deletedAt).slice(0, 50);
  },

  getWordsByType: async (contentType: string): Promise<Word[]> => {
    const db = await getDB();
    const words = await db.getAllFromIndex(STORE_NAME, 'by-contentType');
    return words.filter(w => w.contentType === contentType && !w.deletedAt);
  },

  // Get sync metadata
  getSyncMeta: async (): Promise<SyncStatus> => {
    const db = await getDB();
    const deviceId = getDeviceId();
    const meta = await db.get(SYNC_STORE, deviceId);
    return {
      isOnline: navigator.onLine,
      lastSyncAt: meta?.lastSyncAt || null,
      pendingChanges: meta?.pendingChanges || 0,
      syncVersion: meta?.syncVersion || 0,
      deviceId,
    };
  },

  // Update sync metadata
  updateSyncMeta: async (meta: Partial<SyncStatus>): Promise<void> => {
    const db = await getDB();
    const deviceId = getDeviceId();
    const existing = await db.get(SYNC_STORE, deviceId) || {
      deviceId,
      lastSyncAt: 0,
      syncVersion: 0,
      pendingChanges: 0,
    };
    await db.put(SYNC_STORE, { ...existing, ...meta });
  },
};

// ============================================================
// Cloud API Adapter
// ============================================================
const API_BASE = 'https://yishan-api.15703377328.workers.dev';

const apiAdapter = {
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      authService.logout();
      window.location.reload();
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API Request Failed');
    }
    return response.json();
  },

  // Sync changes with server
  async sync(deviceId: string, lastSyncAt: number, changes: SyncChange[]): Promise<{
    changes: Word[];
    syncVersion: number;
    serverTime: number;
  }> {
    return this.fetchWithAuth(`${API_BASE}/api/sync`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, lastSyncAt, changes }),
    });
  },
};

// ============================================================
// Public API - Local-first with background sync
// ============================================================
export const db = {
  // Check if using guest mode (no cloud account)
  isGuestMode: (): boolean => {
    return !authService.getToken();
  },

  // ============================================================
  // Sync Operations
  // ============================================================
  
  // Trigger manual sync (call periodically or on user action)
  sync: async (): Promise<{ synced: number; conflicts: number }> => {
    if (db.isGuestMode()) {
      return { synced: 0, conflicts: 0 };
    }

    const meta = await localAdapter.getSyncMeta();
    if (!navigator.onLine) {
      return { synced: 0, conflicts: 0 };
    }

    try {
      // For now, just pull changes from server
      // TODO: Implement bidirectional sync with conflict resolution
      const result = await apiAdapter.sync(meta.deviceId, meta.lastSyncAt || 0, []);
      
      // Merge server changes into local DB
      for (const serverWord of result.changes) {
        const localWord = await (await getDB()).get(STORE_NAME, serverWord.id);
        
        if (!localWord || (serverWord.updatedAt && serverWord.updatedAt > (localWord.updatedAt || 0))) {
          await localAdapter.updateWord(serverWord);
        }
      }

      // Update sync metadata
      await localAdapter.updateSyncMeta({
        lastSyncAt: result.serverTime * 1000,
        syncVersion: result.syncVersion,
        pendingChanges: 0,
      });

      return { synced: result.changes.length, conflicts: 0 };
    } catch (error) {
      console.error('Sync failed:', error);
      return { synced: 0, conflicts: 0 };
    }
  },

  getSyncStatus: async (): Promise<SyncStatus> => {
    return localAdapter.getSyncMeta();
  },

  // ============================================================
  // Word CRUD Operations
  // ============================================================

  getWords: async (): Promise<Word[]> => {
    // Always return local data first
    const local = await localAdapter.getWords();
    
    // Trigger background sync if online and not guest
    if (!db.isGuestMode() && navigator.onLine) {
      db.sync().catch(console.error);
    }
    
    return local.filter(w => !w.deletedAt);
  },

  getDueWords: async (): Promise<Word[]> => {
    return localAdapter.getDueWords();
  },

  getWordsByType: async (contentType: string): Promise<Word[]> => {
    return localAdapter.getWordsByType(contentType);
  },

  addWord: async (word: Word): Promise<void> => {
    await localAdapter.addWord(word);
    
    // Queue for sync
    await localAdapter.updateSyncMeta({
      pendingChanges: (await localAdapter.getSyncMeta()).pendingChanges + 1
    });
  },

  updateWord: async (word: Word): Promise<void> => {
    const updated = { ...word, updatedAt: Date.now() };
    await localAdapter.updateWord(updated);
    
    // Queue for sync
    await localAdapter.updateSyncMeta({
      pendingChanges: (await localAdapter.getSyncMeta()).pendingChanges + 1
    });
  },

  deleteWord: async (id: string): Promise<void> => {
    // Soft delete for sync
    const word = await (await getDB()).get(STORE_NAME, id);
    if (word) {
      const deleted = { ...word, deletedAt: Date.now(), updatedAt: Date.now() };
      await localAdapter.updateWord(deleted);
    } else {
      await localAdapter.deleteWord(id);
    }
    
    // Queue for sync
    await localAdapter.updateSyncMeta({
      pendingChanges: (await localAdapter.getSyncMeta()).pendingChanges + 1
    });
  },

  importWords: async (words: Word[]): Promise<void> => {
    await localAdapter.saveWords(words);
    
    // Queue for sync
    await localAdapter.updateSyncMeta({
      pendingChanges: (await localAdapter.getSyncMeta()).pendingChanges + words.length
    });
  },

  // ============================================================
  // Stats & Analytics
  // ============================================================

  getAllWordsForStats: async (): Promise<Word[]> => {
    return localAdapter.getWords();
  },

  getLibraryWords: async (page: number = 1, limit: number = 20): Promise<Word[]> => {
    const all = await localAdapter.getWords();
    all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const start = (page - 1) * limit;
    return all.slice(start, start + limit);
  },
};

export default db;
