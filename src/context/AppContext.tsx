import { useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, GroceryList, GroceryItem, PWAInstallPrompt } from '../types';
import { AppContext } from './AppContextDefinition';
import { getAllLists, saveLists, getItemsForList, saveItems } from '../utils/storage';
import { addOnlineListener, setupInstallPrompt, registerServiceWorker } from '../utils/pwa';
import { syncQueue, initializeBackgroundSync, registerBackgroundSync } from '../utils/syncQueue';

type AppAction =
  | { type: 'SET_LISTS'; payload: GroceryList[] }
  | { type: 'SET_CURRENT_LIST'; payload: string | null }
  | { type: 'ADD_LIST'; payload: GroceryList }
  | { type: 'UPDATE_LIST'; payload: GroceryList }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'ADD_ITEM'; payload: { listId: string; item: GroceryItem } }
  | { type: 'UPDATE_ITEM'; payload: GroceryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'TOGGLE_ITEM_COMPLETE'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_INSTALL_PROMPT'; payload: PWAInstallPrompt | null }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'error' };

const initialState: AppState = {
  lists: [],
  currentListId: null,
  isOnline: navigator.onLine,
  installPrompt: null,
  syncStatus: 'idle'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LISTS':
      return { ...state, lists: action.payload };

    case 'SET_CURRENT_LIST':
      return { ...state, currentListId: action.payload };

    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };

    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id ? action.payload : list
        )
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        currentListId: state.currentListId === action.payload ? null : state.currentListId
      };

    case 'ADD_ITEM':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, items: [...list.items, action.payload.item] }
            : list
        )
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          items: list.items.map(item =>
            item.id === action.payload.id ? action.payload : item
          )
        }))
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          items: list.items.filter(item => item.id !== action.payload)
        }))
      };

    case 'TOGGLE_ITEM_COMPLETE':
      return {
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          items: list.items.map(item =>
            item.id === action.payload
              ? { ...item, isCompleted: !item.isCompleted, updatedAt: new Date() }
              : item
          )
        }))
      };

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'SET_INSTALL_PROMPT':
      return { ...state, installPrompt: action.payload };

    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };

    default:
      return state;
  }
}


export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on startup
  useEffect(() => {
    async function loadData() {
      try {
        const lists = await getAllLists();
        const listsWithItems = await Promise.all(
          lists.map(async (list) => {
            const items = await getItemsForList(list.id);
            return { ...list, items };
          })
        );
        dispatch({ type: 'SET_LISTS', payload: listsWithItems });
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    loadData();
  }, []);

  // Set up online/offline listeners
  useEffect(() => {
    const cleanup = addOnlineListener((isOnline) => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
    });

    return cleanup;
  }, []);

  // Set up PWA install prompt
  useEffect(() => {
    setupInstallPrompt().then((prompt) => {
      dispatch({ type: 'SET_INSTALL_PROMPT', payload: prompt });
    });
  }, []);
  // Register service worker
  useEffect(() => {
    registerServiceWorker();
  }, []);  // Initialize background sync
  useEffect(() => {
    initializeBackgroundSync();
    registerBackgroundSync();
    console.log('Background sync initialized');
  }, []);

  // Auto-save lists to storage
  useEffect(() => {
    if (state.lists.length > 0) {
      saveLists(state.lists).catch(console.error);
      
      // Save items separately
      const allItems = state.lists.flatMap(list => list.items);
      saveItems(allItems).catch(console.error);
    }
  }, [state.lists]);
  const actions = {
    setCurrentList: (listId: string | null) =>
      dispatch({ type: 'SET_CURRENT_LIST', payload: listId }),    addList: (list: GroceryList) => {
      dispatch({ type: 'ADD_LIST', payload: list });
      syncQueue.queueListCreate(list).catch(console.error);
    },

    updateList: (list: GroceryList) => {
      dispatch({ type: 'UPDATE_LIST', payload: list });
      syncQueue.queueListUpdate(list).catch(console.error);
    },

    deleteList: (listId: string) => {
      dispatch({ type: 'DELETE_LIST', payload: listId });
      syncQueue.queueListDelete(listId).catch(console.error);
    },

    addItem: (listId: string, item: GroceryItem) => {
      dispatch({ type: 'ADD_ITEM', payload: { listId, item } });
      syncQueue.queueItemCreate(item, listId).catch(console.error);
    },    updateItem: (item: GroceryItem) => {
      dispatch({ type: 'UPDATE_ITEM', payload: item });
      // Find the list this item belongs to
      const list = state.lists.find(l => l.items.some(i => i.id === item.id));
      if (list) {
        syncQueue.queueItemUpdate(item, list.id).catch(console.error);
      }
    },

    deleteItem: (itemId: string) => {
      dispatch({ type: 'DELETE_ITEM', payload: itemId });
      // Find the list this item belongs to
      const list = state.lists.find(l => l.items.some(i => i.id === itemId));
      if (list) {
        syncQueue.queueItemDelete(itemId, list.id).catch(console.error);
      }
    },    toggleItemComplete: (itemId: string) => {
      dispatch({ type: 'TOGGLE_ITEM_COMPLETE', payload: itemId });
      // Find the updated item and queue for sync
      const list = state.lists.find(l => l.items.some(i => i.id === itemId));
      if (list) {
        const item = list.items.find(i => i.id === itemId);
        if (item) {
          const updatedItem = { ...item, isCompleted: !item.isCompleted, updatedAt: new Date() };
          syncQueue.queueItemUpdate(updatedItem, list.id).catch(console.error);
        }
      }
    },

    setOnlineStatus: (isOnline: boolean) =>
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline }),

    setInstallPrompt: (prompt: PWAInstallPrompt | null) =>
      dispatch({ type: 'SET_INSTALL_PROMPT', payload: prompt }),

    setSyncStatus: (status: 'idle' | 'syncing' | 'error') =>
      dispatch({ type: 'SET_SYNC_STATUS', payload: status })  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}
