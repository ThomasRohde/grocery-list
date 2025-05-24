import type { GroceryList, GroceryItem, SyncOperation } from '../types';
import { openDB } from 'idb';

// Type declarations for Background Sync API
declare global {
  interface ServiceWorkerRegistration {
    sync?: {
      register: (tag: string) => Promise<void>;
    };
  }
}

const SYNC_QUEUE_STORE = 'syncQueue';

export class SyncQueue {
  private dbPromise = openDB('grocery-sync', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const store = db.createObjectStore(SYNC_QUEUE_STORE, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }
    },
  });

  async addToQueue(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> {
    const db = await this.dbPromise;
    const syncItem: Omit<SyncOperation, 'id'> = {
      ...operation,
      timestamp: Date.now()
    };
    
    await db.add(SYNC_QUEUE_STORE, syncItem);
    console.log('Added to sync queue:', syncItem);
  }

  async getQueuedOperations(): Promise<SyncOperation[]> {
    const db = await this.dbPromise;
    return await db.getAllFromIndex(SYNC_QUEUE_STORE, 'timestamp');
  }

  async removeFromQueue(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(SYNC_QUEUE_STORE, id);
  }

  async clearQueue(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(SYNC_QUEUE_STORE);
  }

  async processSyncQueue(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Offline - skipping sync queue processing');
      return;
    }

    const operations = await this.getQueuedOperations();
    console.log(`Processing ${operations.length} queued operations`);

    for (const operation of operations) {
      try {
        await this.processOperation(operation);
        await this.removeFromQueue(operation.id!);
        console.log('Successfully processed and removed operation:', operation.id);
      } catch (error) {
        console.error('Failed to process operation:', operation.id, error);
        // Keep the operation in queue for retry
      }
    }
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    // In a real implementation, this would sync with a backend API
    // For now, we'll just simulate the sync process
    console.log('Processing sync operation:', operation);
    
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(resolve, 100);
    });
  }

  // Helper methods for common operations
  async queueListCreate(list: GroceryList): Promise<void> {
    await this.addToQueue({
      type: 'create',
      entityType: 'list',
      entityId: list.id,
      data: list
    });
  }

  async queueListUpdate(list: GroceryList): Promise<void> {
    await this.addToQueue({
      type: 'update',
      entityType: 'list',
      entityId: list.id,
      data: list
    });
  }

  async queueListDelete(listId: string): Promise<void> {
    await this.addToQueue({
      type: 'delete',
      entityType: 'list',
      entityId: listId,
      data: null
    });
  }

  async queueItemCreate(item: GroceryItem, listId: string): Promise<void> {
    await this.addToQueue({
      type: 'create',
      entityType: 'item',
      entityId: item.id,
      data: { ...item, listId }
    });
  }

  async queueItemUpdate(item: GroceryItem, listId: string): Promise<void> {
    await this.addToQueue({
      type: 'update',
      entityType: 'item',
      entityId: item.id,
      data: { ...item, listId }
    });
  }

  async queueItemDelete(itemId: string, listId: string): Promise<void> {
    await this.addToQueue({
      type: 'delete',
      entityType: 'item',
      entityId: itemId,
      data: { listId }
    });
  }
}

export const syncQueue = new SyncQueue();

// Set up automatic sync when coming back online
export const initializeBackgroundSync = (): void => {
  window.addEventListener('online', () => {
    console.log('Back online - processing sync queue');
    syncQueue.processSyncQueue();
  });

  // Also process queue periodically when online
  setInterval(() => {
    if (navigator.onLine) {
      syncQueue.processSyncQueue();
    }
  }, 30000); // Every 30 seconds
};

// Service Worker background sync (for when the app is closed)
export const registerBackgroundSync = (): void => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      // Register for background sync with proper type assertion
      return registration.sync?.register('background-sync');
    }).catch((error) => {
      console.log('Background sync registration failed:', error);
    });
  }
};
