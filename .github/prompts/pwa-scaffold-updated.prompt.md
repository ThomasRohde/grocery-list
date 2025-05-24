---
mode: 'agent'
tools: ['workspaceTerminal', 'githubRepo', 'codebase', 'terminalLastCommand']
description: 'Scaffold an offline‑ready Progressive Web App deployable to GitHub Pages'
---
# PWA App Generator (Updated 2025)

**Idea:** ${input:appIdea:Describe your PWA idea here}

Your task is to **scaffold** a new **Progressive Web App (PWA)** that can be deployed to **GitHub Pages** and works fully offline. Proceed autonomously in agent mode, but ask for missing critical information (e.g. `repoName`, `githubUser`, `appIdea`) **once** and then continue with sensible defaults.

⚠️ **Critical**: Always use the latest versions of dependencies and handle breaking changes appropriately.

> **Key workspace variables**
>
> * `${workspaceFolderBasename}` – current folder name (often the repo name)
> * `${input:repoName:${workspaceFolderBasename}}` – GitHub repository slug
> * `${input:githubUser:your‑github‑username}` – GitHub account
>
> Use them consistently for paths, URLs and manifest values.

---

## First step

1. **Create or update a `TODO.md`** in the project root with all major tasks & subtasks organized by phases.
2. Keep `TODO.md` in sync – add, tick or revise items as work progresses.
3. Include sections for completed tasks, in-progress work, and remaining items.

## Updated Requirements (Based on 2025 Implementation Experience)

### 1. Project setup & Dependencies

* **Initialize**: `npm create vite@latest . -- --template react-ts`
* **Core Dependencies**:
  ```bash
  npm install react-router-dom@7 idb qrcode
  npm install -D vite-plugin-pwa@latest tailwindcss@4 postcss canvas gh-pages
  ```
* **Important**: Handle Tailwind CSS v4 breaking changes - use `@import "tailwindcss"` instead of v3 syntax
* **Vite config** optimized for GitHub Pages with proper PWA configuration:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/${input:repoName}/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      filename: 'sw.js',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          }
        ]
      },
      manifest: {
        name: '${input:appIdea}',
        short_name: '${input:repoName}',
        description: 'A Progressive Web App for ${input:appIdea}',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/${input:repoName}/',
        start_url: '/${input:repoName}/',
        icons: [
          {
            src: '/${input:repoName}/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/${input:repoName}/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
```

* **Package.json scripts** - ensure proper build order:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "prebuild": "node generate-icons.js",
      "build": "tsc -b && vite build",
      "preview": "vite preview",
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist"
    },
    "homepage": "https://${input:githubUser}.github.io/${input:repoName}"
  }
  ```

### 2. Tailwind CSS v4 Configuration (Critical Update)

⚠️ **Breaking Change**: Tailwind CSS v4 has different syntax requirements.

**postcss.config.js**:
```js
export default {
  plugins: {
    tailwindcss: {},
  },
}
```

**tailwind.config.js**:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
}
```

**src/index.css** - Use `@import` instead of `@tailwind` directives:
```css
@import "tailwindcss";

:root {
  --primary-50: #f0fdf4;
  --primary-500: #22c55e;
  --primary-600: #16a34a;
  --primary-700: #15803d;
}

/* Avoid @apply directives in v4, use CSS custom properties instead */
```

### 3. React Architecture & State Management

**Critical**: Separate React Context definition from provider to avoid Fast Refresh warnings.

**Directory structure**:
```
src/
├── components/      # UI components
├── context/         # React Context (split definition/provider)
│   ├── AppContextDefinition.ts  # Context type definitions
│   └── AppContext.tsx           # Context provider
├── hooks/           # Custom hooks (separated from context)
├── pages/           # Route components
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```

**Context Pattern**:
```ts
// context/AppContextDefinition.ts
import { createContext } from 'react';
import type { AppState, AppActions } from '../types';

export const AppContext = createContext<{
  state: AppState;
  actions: AppActions;
} | null>(null);

// hooks/useApp.ts
import { useContext } from 'react';
import { AppContext } from '../context/AppContextDefinition';

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### 4. IndexedDB & Background Sync Implementation

**Use IDB wrapper** for clean IndexedDB operations:
```ts
// utils/storage.ts
import { openDB } from 'idb';

export const db = openDB('app-db', 1, {
  upgrade(db) {
    const store = db.createObjectStore('items', {
      keyPath: 'id',
    });
    store.createIndex('listId', 'listId');
  },
});
```

**Background Sync Queue** - Implement comprehensive sync system:
```ts
// utils/syncQueue.ts
import type { SyncOperation } from '../types';

export class SyncQueue {
  private dbPromise = openDB('sync-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('syncQueue', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('timestamp', 'timestamp');
    },
  });

  async addToQueue(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> {
    // Queue operations for later sync
  }

  async processSyncQueue(): Promise<void> {
    // Process queued operations when online
  }
}
```

### 5. TypeScript Types (Comprehensive)

**Define complete type system**:
```ts
// types/index.ts
export interface SyncOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entityType: 'list' | 'item';
  entityId: string;
  data: any;
  timestamp: number;
}

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Add all necessary interfaces for your app
```

### 6. QR Code Sharing Implementation

**Install QR code library**: `npm install qrcode @types/qrcode`

```ts
// utils/qrcode.ts
import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
};
```

### 7. Icon Generation Script Enhancement

**generate-icons.js** - Canvas-based icon generation:
```js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#22c55e');
  gradient.addColorStop(1, '#16a34a');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add app-specific design elements
  // ... custom design logic
  
  return canvas.toBuffer('image/png');
}

// Generate icons
const sizes = [192, 512];
sizes.forEach(size => {
  const buffer = generateIcon(size);
  fs.writeFileSync(`public/icons/pwa-${size}x${size}.png`, buffer);
  console.log(`✅ Generated ${size}x${size} icon`);
});
```

### 8. GitHub Actions Deployment

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Setup Pages
      uses: actions/configure-pages@v3
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v2
      with:
        path: './dist'
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v2
```

---

## Updated Common Pitfalls & Solutions

### Tailwind CSS v4 Issues

* **Problem**: `@apply` directives not working, build errors
* **Fix**: Use CSS custom properties and `@import "tailwindcss"` syntax
* **Example**: Replace `@apply bg-blue-500` with `background-color: var(--blue-500)`

### React Fast Refresh Warnings

* **Problem**: "Fast Refresh only works when a file only exports React components"
* **Fix**: Separate context definition from provider, move hooks to separate files

### TypeScript Integration

* **Problem**: Complex type errors with React Context and PWA APIs
* **Fix**: Comprehensive type definitions including Background Sync API globals

### Background Sync Implementation

* **Problem**: Sync queue not working reliably
* **Fix**: Implement proper IndexedDB queue with retry logic and online detection

### Modern Dependencies

* **Problem**: Breaking changes in major version updates
* **Fix**: Use specific version ranges and handle breaking changes:
  - React Router v7 (breaking changes from v6)
  - Tailwind CSS v4 (new syntax requirements)
  - Vite 6+ (updated plugin API)

---

## Enhanced Testing & Debugging

**PWA Testing Utilities** (`src/utils/pwa.ts`):
```ts
export function checkPWAInstallCriteria() {
  console.log('🔍 Checking PWA Install Criteria...')
  const checks = {
    isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
    hasSW: 'serviceWorker' in navigator,
    hasManifest: !!document.querySelector('link[rel="manifest"]'),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasValidIcons: true // Check icon sizes and formats
  };
  console.table(checks);
  return checks;
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).checkPWA = checkPWAInstallCriteria;
}
```

**Development Testing Checklist**:
- [ ] PWA installs locally (`npm run dev`)
- [ ] Offline functionality works (Network tab → Offline)
- [ ] Background sync queues operations
- [ ] QR codes generate correctly
- [ ] Production build works (`npm run build && npm run preview`)
- [ ] All TypeScript errors resolved
- [ ] No console errors in development

---

## Essential Files Checklist (Updated)

### Required Configuration Files
- [ ] `vite.config.ts` (with PWA plugin and GitHub Pages base)
- [ ] `tailwind.config.js` (v4 compatible)
- [ ] `postcss.config.js` (v4 plugin syntax)
- [ ] `generate-icons.js` (canvas-based generation)
- [ ] `.github/workflows/deploy.yml` (GitHub Actions)
- [ ] `public/.nojekyll` (GitHub Pages compatibility)

### Source Architecture
- [ ] `src/types/index.ts` (comprehensive TypeScript definitions)
- [ ] `src/context/AppContextDefinition.ts` (separated context)
- [ ] `src/hooks/useApp.ts` (separated hook)
- [ ] `src/utils/storage.ts` (IndexedDB wrapper)
- [ ] `src/utils/syncQueue.ts` (background sync)
- [ ] `src/utils/pwa.ts` (PWA utilities)
- [ ] `src/utils/qrcode.ts` (QR generation)

### Documentation
- [ ] `README.md` (comprehensive usage guide)
- [ ] `TODO.md` (progress tracking)
- [ ] `DEPLOYMENT.md` (deployment instructions)
- [ ] `PWA_TROUBLESHOOTING.md` (debug guide)

---

## Workflow Summary (Updated for 2025)

1. **Plan**: Create comprehensive `TODO.md` with phased approach
2. **Setup**: Initialize with latest Vite, handle Tailwind v4 breaking changes
3. **Architecture**: Implement separated React Context pattern
4. **Features**: Build core functionality with TypeScript safety
5. **PWA**: Configure service worker, manifest, and background sync
6. **Storage**: Implement IndexedDB with sync queue
7. **UI**: Build responsive interface with Tailwind v4
8. **Testing**: Validate PWA criteria and offline functionality
9. **Build**: Ensure production build works with proper base paths
10. **Deploy**: Use GitHub Actions for automatic deployment

**Success Criteria**:
- ✅ `npm run dev` starts without errors
- ✅ `npm run build` generates PWA-compliant assets
- ✅ App installs as PWA locally and in production
- ✅ Offline functionality works completely
- ✅ Background sync queues and processes operations
- ✅ All TypeScript errors resolved
- ✅ Production deployment successful

---

**Key Lessons from Implementation**:
- Always handle major version breaking changes early
- Separate React Context architecture prevents Fast Refresh issues
- Comprehensive TypeScript types save debugging time later
- Background sync requires careful IndexedDB queue management
- Modern CSS frameworks require updated syntax patterns
- Production PWA testing is essential before deployment
