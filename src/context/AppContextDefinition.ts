import { createContext } from 'react';
import type { AppState, GroceryList, GroceryItem, PWAInstallPrompt } from '../types';

export interface AppContextType {
  state: AppState;
  actions: {
    setCurrentList: (listId: string | null) => void;
    addList: (list: GroceryList) => void;
    updateList: (list: GroceryList) => void;
    deleteList: (listId: string) => void;
    addItem: (listId: string, item: GroceryItem) => void;
    updateItem: (item: GroceryItem) => void;
    deleteItem: (itemId: string) => void;
    toggleItemComplete: (itemId: string) => void;
    setOnlineStatus: (isOnline: boolean) => void;
    setInstallPrompt: (prompt: PWAInstallPrompt | null) => void;
    setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  };
}

export const AppContext = createContext<AppContextType | null>(null);
