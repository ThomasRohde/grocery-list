import type { PWAInstallPrompt, BeforeInstallPromptEvent, PWADebugResult } from '../types';

// PWA Install utilities
export function checkPWAInstallCriteria(): PWADebugResult {
  console.log('🔍 Checking PWA Install Criteria...');
  const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
  const hasSW = 'serviceWorker' in navigator;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInstallable = !isStandalone;
  const userAgent = navigator.userAgent;
  
  console.log({ 
    isHTTPS, 
    hasSW, 
    isStandalone, 
    isInstallable,
    userAgent
  });
  
  // Additional debugging for manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  console.log('Manifest link:', manifestLink);
  
  // Check if already installed
  if (isStandalone) {
    console.log('🎉 PWA is already installed and running in standalone mode');
  }
  
  return { isHTTPS, hasSW, isStandalone, isInstallable, userAgent };
}

// Enhanced PWA debugging function
export async function debugPWAStatus(): Promise<PWADebugResult> {
  console.log('🛠️ PWA Debug Status');
  
  // Check basic criteria
  const criteria = checkPWAInstallCriteria();
  
  // Check service worker registration
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Service Worker registrations:', registrations);
      
      if (registrations.length > 0) {
        const sw = registrations[0];
        console.log('SW State:', {
          scope: sw.scope,
          active: !!sw.active,
          installing: !!sw.installing,
          waiting: !!sw.waiting
        });
      }
    } catch (error) {
      console.error('Service Worker check failed:', error);
    }
  }
    // Check manifest
  try {
    // Use relative path that respects the base URL
    const manifestPath = import.meta.env.PROD ? '/grocery-list/manifest.webmanifest' : '/manifest.webmanifest';
    const manifestResponse = await fetch(manifestPath);
    const manifest = await manifestResponse.json();
    console.log('Manifest loaded:', manifest);
    
    // Validate critical manifest fields
    const requiredFields = ['name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    if (missingFields.length > 0) {
      console.warn('Missing manifest fields:', missingFields);
    }
    
    // Check icons
    if (manifest.icons && manifest.icons.length > 0) {
      console.log('Manifest icons:', manifest.icons);
      
      // Test if icons are accessible
      for (const icon of manifest.icons) {
        try {
          const iconResponse = await fetch(icon.src);
          console.log(`Icon ${icon.src}: ${iconResponse.ok ? '✅' : '❌'}`);
        } catch (error) {
          console.error(`Icon ${icon.src} failed:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Manifest check failed:', error);
  }
  
  return criteria;
}

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  window.checkPWAInstallCriteria = checkPWAInstallCriteria;
  window.debugPWAStatus = debugPWAStatus;
}

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
    // Use relative path that respects the base URL
    const swPath = import.meta.env.PROD ? '/grocery-list/sw.js' : '/sw.js';
    const swScope = import.meta.env.PROD ? '/grocery-list/' : '/';
    
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: swScope
    });
    
    console.log('SW registered: ', registration);
    console.log('SW scope: ', registration.scope);
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
      
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      const installPrompt: PWAInstallPrompt = {
        prompt: () => {
          beforeInstallEvent.prompt();
        },
        userChoice: beforeInstallEvent.userChoice
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
    if ('sync' in registration && registration.sync) {
      await registration.sync.register(tag);
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
