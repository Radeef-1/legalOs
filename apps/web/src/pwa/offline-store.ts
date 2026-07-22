"use client";

export interface CachedOfflineAction {
  id: string;
  type: 'CREATE_CASE' | 'ADD_NOTE' | 'UPLOAD_DOC' | 'COMPLETE_TASK';
  payload: any;
  timestamp: number;
}

const DB_NAME = 'LegalOS_Offline_DB';
const DB_VERSION = 1;

export class OfflineStore {
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cases')) {
          db.createObjectStore('cases', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offline_actions')) {
          db.createObjectStore('offline_actions', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  /**
   * Caches active cases for offline access.
   */
  async cacheCases(cases: any[]): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('cases', 'readwrite');
      const store = tx.objectStore('cases');
      cases.forEach((item) => store.put(item));
    } catch (err) {
      console.log('[OfflineStore] Failed to cache cases:', err);
    }
  }

  /**
   * Retrieves cached cases when offline.
   */
  async getCachedCases(): Promise<any[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('cases', 'readonly');
        const store = tx.objectStore('cases');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Enqueues an offline action to be auto-synced when back online.
   */
  async queueAction(type: CachedOfflineAction['type'], payload: any): Promise<CachedOfflineAction> {
    const db = await this.openDB();
    const action: CachedOfflineAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type,
      payload,
      timestamp: Date.now(),
    };

    const tx = db.transaction('offline_actions', 'readwrite');
    tx.objectStore('offline_actions').put(action);
    console.log('[OfflineStore] Action queued offline:', action);
    return action;
  }

  /**
   * Gets all queued offline actions.
   */
  async getQueuedActions(): Promise<CachedOfflineAction[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('offline_actions', 'readonly');
        const store = tx.objectStore('offline_actions');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Clears processed action from offline queue.
   */
  async clearAction(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('offline_actions', 'readwrite');
      tx.objectStore('offline_actions').delete(id);
    } catch (err) {
      console.log('[OfflineStore] Failed to clear action:', err);
    }
  }
}

export const offlineStore = new OfflineStore();
