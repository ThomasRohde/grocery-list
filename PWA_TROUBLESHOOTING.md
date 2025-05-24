# PWA Troubleshooting Guide

This guide helps diagnose and fix common Progressive Web App issues.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Offline Functionality](#offline-functionality)
3. [Service Worker Problems](#service-worker-problems)
4. [Data Storage Issues](#data-storage-issues)
5. [Browser Compatibility](#browser-compatibility)
6. [Development Issues](#development-issues)
7. [Performance Problems](#performance-problems)

## Installation Issues

### PWA Install Prompt Not Appearing

**Symptoms**: "Add to Home Screen" option not available

**Diagnosis**:
1. Open Chrome DevTools > Application > Manifest
2. Check for manifest errors
3. Verify service worker registration
4. Ensure HTTPS (required for PWA)

**Solutions**:

✅ **Check Manifest Requirements**:
```json
{
  "name": "Grocery List PWA",
  "short_name": "GroceryList",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/pwa-512x512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

✅ **Verify Service Worker**:
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

✅ **Force Install Prompt** (Development):
```javascript
// In DevTools Console
window.location.reload();
// Wait for page load, then:
window.dispatchEvent(new Event('beforeinstallprompt'));
```

### Install Button Not Working

**Symptoms**: Install button appears but doesn't work

**Solutions**:

✅ **Check Install Prompt Handler**:
```typescript
// src/components/InstallPrompt.tsx
const handleInstall = async () => {
  if (installPrompt) {
    const result = await installPrompt.prompt();
    console.log('Install result:', result);
    setInstallPrompt(null);
  }
};
```

✅ **Verify Browser Support**:
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Add to Home Screen only

## Offline Functionality

### App Not Working Offline

**Symptoms**: White screen or errors when offline

**Diagnosis**:
1. Open DevTools > Application > Service Workers
2. Check "Offline" checkbox
3. Reload page and test functionality

**Solutions**:

✅ **Check Service Worker Cache**:
```javascript
// In DevTools Console
caches.keys().then(keys => {
  console.log('Cache names:', keys);
  return Promise.all(
    keys.map(key => caches.open(key).then(cache => cache.keys()))
  );
}).then(allCaches => {
  console.log('Cached resources:', allCaches);
});
```

✅ **Verify Workbox Configuration**:
```typescript
// vite.config.ts
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'documents',
      },
    },
  ],
}
```

### Data Not Persisting Offline

**Symptoms**: Lists disappear when offline

**Solutions**:

✅ **Check IndexedDB Storage**:
```javascript
// In DevTools Console
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
});
```

✅ **Verify Storage Implementation**:
```typescript
// src/utils/storage.ts
import { openDB } from 'idb';

const dbPromise = openDB('grocery-db', 1, {
  upgrade(db) {
    // Ensure object stores are created
    if (!db.objectStoreNames.contains('lists')) {
      db.createObjectStore('lists', { keyPath: 'id' });
    }
  },
});
```

## Service Worker Problems

### Service Worker Not Updating

**Symptoms**: Old version of app loads after deployment

**Solutions**:

✅ **Force Service Worker Update**:
```javascript
// In DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.update();
  });
});
```

✅ **Clear Service Worker Cache**:
```javascript
// In DevTools Console
caches.keys().then(keys => {
  Promise.all(keys.map(key => caches.delete(key)));
});
```

✅ **Check Update Strategy**:
```typescript
// vite.config.ts
VitePWA({
  workbox: {
    skipWaiting: true,        // Auto-activate new service worker
    clientsClaim: true,       // Take control immediately
  },
})
```

### Service Worker Registration Failed

**Symptoms**: Console errors about service worker registration

**Solutions**:

✅ **Check HTTPS Requirement**:
- Service workers require HTTPS in production
- Use `http://localhost` for development

✅ **Verify Service Worker Path**:
```typescript
// src/utils/pwa.ts
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
};
```

## Data Storage Issues

### IndexedDB Not Working

**Symptoms**: Data not saving or loading

**Diagnosis**:
1. Open DevTools > Application > Storage > IndexedDB
2. Check if database and stores exist
3. Verify data structure

**Solutions**:

✅ **Check Browser Support**:
```typescript
const checkIndexedDBSupport = () => {
  if (!('indexedDB' in window)) {
    console.error('IndexedDB not supported');
    return false;
  }
  return true;
};
```

✅ **Handle Storage Quota**:
```typescript
// Check storage quota
navigator.storage.estimate().then(estimate => {
  console.log('Storage quota:', estimate);
  if (estimate.usage && estimate.quota) {
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    console.log(`Storage used: ${percentUsed.toFixed(2)}%`);
  }
});
```

✅ **Implement Error Handling**:
```typescript
// src/utils/storage.ts
export const saveLists = async (lists: GroceryList[]) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('lists', 'readwrite');
    await Promise.all([
      ...lists.map(list => tx.store.put(list)),
      tx.done
    ]);
  } catch (error) {
    console.error('Failed to save lists:', error);
    // Fallback to localStorage
    localStorage.setItem('grocery-lists', JSON.stringify(lists));
  }
};
```

### Data Sync Issues

**Symptoms**: Data not syncing between devices

**Solutions**:

✅ **Implement Sync Queue**:
```typescript
// src/utils/syncQueue.ts (future implementation)
export const syncData = async () => {
  if (!navigator.onLine) {
    console.log('Offline - queuing for sync');
    return;
  }
  
  // Process sync queue
  const pendingChanges = await getSyncQueue();
  for (const change of pendingChanges) {
    await syncChange(change);
  }
};
```

## Browser Compatibility

### Features Not Working in Safari

**Common Issues**:
- Service worker limitations
- PWA install differences
- IndexedDB quirks

**Solutions**:

✅ **Safari-Specific Handling**:
```typescript
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // Handle Safari-specific behavior
  console.log('Safari detected - using fallback strategies');
}
```

✅ **Polyfills for Older Browsers**:
```typescript
// Check for required features
const hasRequiredFeatures = () => {
  return (
    'serviceWorker' in navigator &&
    'indexedDB' in window &&
    'Promise' in window
  );
};
```

### PWA Features Missing

**Symptoms**: Some PWA features don't work in certain browsers

**Browser Support Matrix**:

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ | ✅ | ✅ | ✅ |
| Web App Manifest | ✅ | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ❌ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Push Notifications | ✅ | ✅ | ❌ | ✅ |

## Development Issues

### Build Errors

**Common Errors and Solutions**:

✅ **TypeScript Errors**:
```bash
# Check types
npx tsc --noEmit

# Common fixes
npm install @types/node --save-dev
```

✅ **Vite Build Issues**:
```bash
# Clear cache
rm -rf node_modules/.vite
npm run build
```

✅ **PWA Plugin Errors**:
```typescript
// Check vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Ensure configuration is valid
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

### Hot Reload Issues

**Symptoms**: Changes not reflecting in development

**Solutions**:

✅ **Check Vite Configuration**:
```typescript
export default defineConfig({
  server: {
    hmr: true,
    port: 5173
  }
});
```

✅ **Clear Browser Cache**:
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Clear site data in DevTools > Application > Storage

## Performance Problems

### Slow Loading

**Diagnosis**:
1. Open DevTools > Network tab
2. Check resource loading times
3. Run Lighthouse audit

**Solutions**:

✅ **Optimize Bundle Size**:
```bash
# Analyze bundle
npm run build
npx vite-bundle-analyzer dist/
```

✅ **Implement Code Splitting**:
```typescript
// Lazy load components
const ListPage = lazy(() => import('./pages/ListPage'));
const SharedListPage = lazy(() => import('./pages/SharedListPage'));
```

✅ **Optimize Assets**:
```bash
# Compress images
npm install imagemin-cli -g
imagemin src/assets/* --out-dir=dist/assets --plugin=imagemin-mozjpeg
```

### Memory Issues

**Symptoms**: Browser becomes slow or crashes

**Solutions**:

✅ **Monitor Memory Usage**:
```typescript
// Check memory usage
const memoryInfo = (performance as any).memory;
if (memoryInfo) {
  console.log('Memory usage:', {
    used: memoryInfo.usedJSHeapSize,
    total: memoryInfo.totalJSHeapSize,
    limit: memoryInfo.jsHeapSizeLimit
  });
}
```

✅ **Cleanup Resources**:
```typescript
// In React components
useEffect(() => {
  const cleanup = () => {
    // Clean up listeners, timers, etc.
  };
  
  return cleanup;
}, []);
```

## Debug Tools and Commands

### Chrome DevTools

**Essential Panels**:
- Application > Service Workers
- Application > Manifest  
- Application > Storage > IndexedDB
- Network > Offline checkbox
- Lighthouse audit

### Useful Console Commands

```javascript
// Service worker info
navigator.serviceWorker.getRegistrations()

// Cache contents
caches.keys().then(console.log)

// Storage estimation
navigator.storage.estimate().then(console.log)

// Force PWA install prompt (development)
window.dispatchEvent(new Event('beforeinstallprompt'))

// Check if app is installed
window.matchMedia('(display-mode: standalone)').matches
```

### Command Line Tools

```bash
# Test PWA features
npx pwa-asset-generator

# Lighthouse CLI
npm install -g lighthouse
lighthouse http://localhost:5173 --view

# Workbox CLI
npx workbox-cli --help
```

## Getting Help

### When to File an Issue

- Reproducible bugs
- Feature requests
- Documentation improvements
- Performance problems

### Information to Include

1. **Environment**:
   - Browser and version
   - Operating system
   - Node.js version

2. **Steps to Reproduce**:
   - Exact steps taken
   - Expected vs actual behavior
   - Screenshots/recordings

3. **Debug Information**:
   - Console errors
   - Network tab info
   - Service worker status

### Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Chrome DevTools PWA Guide](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)
