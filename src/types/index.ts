export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  shareCode?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface SyncData {
  lists: GroceryList[];
  lastSync: Date;
  version: number;
}

export interface PWAInstallPrompt {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface AppState {
  lists: GroceryList[];
  currentListId: string | null;
  isOnline: boolean;
  installPrompt: PWAInstallPrompt | null;
  syncStatus: 'idle' | 'syncing' | 'error';
}

export type GroceryCategory = 
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'household'
  | 'other';

export interface QRShareData {
  listId: string;
  listName: string;
  shareCode: string;
  url: string;
}

// Background sync types
export interface SyncOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entityType: 'list' | 'item';
  entityId: string;
  data: GroceryList | GroceryItem | { listId: string } | null;
  timestamp: number;
}

// PWA Install Prompt Event Interface
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
  prompt(): Promise<void>;
}

// PWA Debug result interface
export interface PWADebugResult {
  isHTTPS: boolean;
  hasSW: boolean;
  isStandalone: boolean;
  isInstallable: boolean;
  userAgent: string;
}

// Window interface extension for debugging
declare global {
  interface Window {
    checkPWAInstallCriteria?: () => PWADebugResult;
    debugPWAStatus?: () => Promise<PWADebugResult>;
  }
  
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}
