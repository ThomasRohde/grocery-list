import { openDB, type IDBPDatabase } from 'idb';
import type { GroceryList, GroceryItem, SyncData } from '../types';

const DB_NAME = 'GroceryListDB';
const DB_VERSION = 1;

interface GroceryDB {
  lists: {
    key: string;
    value: GroceryList;
  };
  items: {
    key: string;
    value: GroceryItem;
  };
  sync: {
    key: string;
    value: SyncData;
  };
}

let db: IDBPDatabase<GroceryDB>;

export async function initDB(): Promise<IDBPDatabase<GroceryDB>> {
  if (db) return db;

  db = await openDB<GroceryDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Create lists store
      if (!database.objectStoreNames.contains('lists')) {
        const listsStore = database.createObjectStore('lists', { keyPath: 'id' });
        listsStore.createIndex('updatedAt', 'updatedAt');
      }

      // Create items store
      if (!database.objectStoreNames.contains('items')) {
        const itemsStore = database.createObjectStore('items', { keyPath: 'id' });
        itemsStore.createIndex('listId', 'listId');
        itemsStore.createIndex('updatedAt', 'updatedAt');
      }

      // Create sync store
      if (!database.objectStoreNames.contains('sync')) {
        database.createObjectStore('sync', { keyPath: 'id' });
      }
    },
  });

  return db;
}

// Lists operations
export async function saveLists(lists: GroceryList[]): Promise<void> {
  const database = await initDB();
  const tx = database.transaction('lists', 'readwrite');
  
  for (const list of lists) {
    await tx.store.put(list);
  }
  
  await tx.done;
}

export async function getList(id: string): Promise<GroceryList | undefined> {
  const database = await initDB();
  return database.get('lists', id);
}

export async function getAllLists(): Promise<GroceryList[]> {
  const database = await initDB();
  return database.getAll('lists');
}

export async function deleteList(id: string): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(['lists', 'items'], 'readwrite');
  
  // Delete the list
  await tx.objectStore('lists').delete(id);
  
  // Delete all items in the list
  const itemsIndex = tx.objectStore('items').index('listId');
  const items = await itemsIndex.getAll(id);
  
  for (const item of items) {
    await tx.objectStore('items').delete(item.id);
  }
  
  await tx.done;
}

// Items operations
export async function saveItems(items: GroceryItem[]): Promise<void> {
  const database = await initDB();
  const tx = database.transaction('items', 'readwrite');
  
  for (const item of items) {
    await tx.store.put(item);
  }
  
  await tx.done;
}

export async function getItemsForList(listId: string): Promise<GroceryItem[]> {
  const database = await initDB();
  const index = database.transaction('items').store.index('listId');
  return index.getAll(listId);
}

export async function deleteItem(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('items', id);
}

// Sync operations
export async function getSyncData(): Promise<SyncData | undefined> {
  const database = await initDB();
  return database.get('sync', 'main');
}

export async function saveSyncData(data: SyncData): Promise<void> {
  const database = await initDB();
  await database.put('sync', { ...data, id: 'main' });
}

// Utility function to clear all data
export async function clearAllData(): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(['lists', 'items', 'sync'], 'readwrite');
  
  await tx.objectStore('lists').clear();
  await tx.objectStore('items').clear();
  await tx.objectStore('sync').clear();
  
  await tx.done;
}
