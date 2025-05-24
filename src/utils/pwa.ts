import type { PWAInstallPrompt } from '../types';

// PWA Install utilities
export function checkPWAInstallCriteria() {
  console.log('🔍 Checking PWA Install Criteria...');
  const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
  const hasSW = 'serviceWorker' in navigator;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInstallable = !isStandalone;
  
  console.log({ 
    isHTTPS, 
    hasSW, 
    isStandalone, 
    isInstallable,
    userAgent: navigator.userAgent 
  });
  
  return { isHTTPS, hasSW, isStandalone, isInstallable };
}

// Make it globally available for debugging
(window as any).checkPWAInstallCriteria = checkPWAInstallCriteria;

// Online/Offline detection
export function isOnline(): boolean {
  return navigator.onLine;
}

export function addOnlineListener(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/grocery-list/sw.js', {
      scope: '/grocery-list/'
    });
    
    console.log('SW registered: ', registration);
    return registration;
  } catch (error) {
    console.log('SW registration failed: ', error);
    return null;
  }
}

// Install prompt handling
export function setupInstallPrompt(): Promise<PWAInstallPrompt | null> {
  return new Promise((resolve) => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      const installPrompt: PWAInstallPrompt = {
        prompt: () => {
          (e as any).prompt();
        },
        userChoice: (e as any).userChoice
      };
      
      resolve(installPrompt);
    });

    // Timeout after 5 seconds if no install prompt is available
    setTimeout(() => resolve(null), 5000);
  });
}

// QR Code generation for sharing
export function generateShareURL(listId: string, shareCode: string): string {
  const baseURL = window.location.origin;
  const path = window.location.pathname.replace(/\/$/, '');
  return `${baseURL}${path}/shared/${listId}?code=${shareCode}`;
}

// Generate a simple share code
export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Background sync utilities
export async function registerBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('Background sync not supported - no service worker');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // Check if sync is available
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log(`Background sync registered for: ${tag}`);
    } else {
      console.log('Background sync not supported in this browser');
    }
  } catch (error) {
    console.log('Background sync registration failed:', error);
  }
}

// Notification utilities (stub for future implementation)
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/grocery-list/icons/pwa-192x192.png',
      badge: '/grocery-list/icons/pwa-192x192.png',
      ...options
    });
  }
}
