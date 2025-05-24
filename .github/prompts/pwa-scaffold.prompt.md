---
mode: 'agent'
tools: ['workspaceTerminal', 'githubRepo', 'codebase', 'terminalLastCommand']
description: 'Scaffold an offline‑ready Progressive Web App deployable to GitHub Pages'
---

⚠️ **UPDATED VERSION AVAILABLE**: See `pwa-scaffold-updated.prompt.md` for the 2025 version with lessons learned from real implementation.

# PWA App Generator

**Idea:** ${input:appIdea:Describe your PWA idea here}

Your task is to **scaffold** a new **Progressive Web App (PWA)** that can be deployed to **GitHub Pages** and works fully offline. Proceed autonomously in agent mode, but ask for missing critical information (e.g. `repoName`, `githubUser`, `appIdea`) **once** and then continue with sensible defaults.

> **Key workspace variables**
>
> * `${workspaceFolderBasename}` – current folder name (often the repo name)
> * `${input:repoName:${workspaceFolderBasename}}` – GitHub repository slug
> * `${input:githubUser:your‑github‑username}` – GitHub account
>
> Use them consistently for paths, URLs and manifest values.

---

## First step

1. **Create or update a `TODO.md`** in the project root with all major tasks & subtasks.
2. Keep `TODO.md` in sync – add, tick or revise items as work progresses.

## General requirements

### 1. Project setup

* Initialise **Vite** with **React + TypeScript**.
* Install and configure **vite-plugin-pwa**.
* **Vite config** tuned for GitHub Pages:

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
      manifest: {
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

* **Scripts** (`package.json`): `dev`, `build`, `prebuild` (icon generation), `deploy`.
* Install icon tooling: `npm install --save-dev canvas`.
* Set `"homepage": "https://${input:githubUser}.github.io/${input:repoName}"`.

### 2. PWA essentials

1. Generate a **`manifest.webmanifest`** with standard fields (`name`, `short_name`, etc.) and absolute icon paths (`/${input:repoName}/icons/...`).
2. Configure **vite-plugin-pwa** to precache build assets and add runtime caching (images & JSON, stale‑while‑revalidate).
3. Create a Service Worker extension if required:

   * Cache dynamic JSON responses in IndexedDB.
   * Provide an offline fallback HTML.
   * Handle the `beforeinstallprompt` event so the UI can trigger install.
4. Guarantee an **offline‑ready landing page** and working navigation for all critical routes.

### 3. Data persistence

* Use **LocalStorage** or **IndexedDB** via a wrapper.
* Provide a React hook that syncs state ↔ storage with debounced writes.
* Ensure read/write works offline.

### 4. State management & architecture

* Directory layout: `components/`, `pages/`, `hooks/`, `context/`, `utils/`, `types/`.
* Responsive UI with **Tailwind CSS**.
* Use React Router; precache each route.

### 5. Enhanced PWA features (optional)

* Stub **push notifications** module (`src/notifications.ts`).
* Add **background sync** queue scaffold.
* Provide Lighthouse audit script (`npm run audit`).

### 6. GitHub Pages deployment

* Base path already set in Vite config (`/${input:repoName}/`).
* Use **GitHub Actions** instead of `gh-pages`:

  * `.github/workflows/deploy.yml` builds & publishes `/dist`.
* Add `public/.nojekyll`.
* Ensure SW scope matches GitHub Pages path.

### 7. Example feature implementation

* Minimal UI to add/edit/delete items stored locally.
* Install‑PWA button.
* Online/offline toast (monitor `navigator.onLine`).

### 8. Documentation

* **README.md** covering setup, dev server, PWA testing, deployment, offline behaviour.
* Keep `TODO.md` updated.
* **DEPLOYMENT.md** – GitHub Pages instructions.
* **PWA_TROUBLESHOOTING.md** – install/debug guide.
* Document icon generation and debugging utilities.

---

## Common pitfalls & troubleshooting

### PWA install button

* **Problem**: Works locally but disappears on GitHub Pages.
* **Fix**: User must interact first; ensure criteria pass.

### Icon issues

* **Problem**: "Resource isn’t a valid image" or 404.
* **Fix**: Icons > 1 KB; absolute paths `/repo-name/icons/*`.

### Service Worker issues

* **Problem**: SW 404 or wrong scope on production.
* **Fix**: Set `filename: 'sw.js'` & correct `scope`.

### Build & deployment

* **Problem**: Assets 404 on GitHub Pages.
* **Fix**: Correct `base` in Vite config; add `.nojekyll`.

### Testing & debugging utilities

Add the following toolkit to `src/utils/pwa.ts` (make globally available):

```ts
export function checkPWAInstallCriteria() {
  console.log('🔍 Checking PWA Install Criteria...')
  const isHTTPS = location.protocol === 'https:'
  const hasSW = 'serviceWorker' in navigator
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  console.log({ isHTTPS, hasSW, isStandalone })
  return { isHTTPS, hasSW, isStandalone }
}
(window as any).checkPWAInstallCriteria = checkPWAInstallCriteria
```

---

## Essential file checklist

* `.github/workflows/deploy.yml`
* `public/.nojekyll`
* `generate-icons.js`
* `vite.config.ts`
* `manifest.webmanifest`

---

## Workflow summary (for Copilot agent)

1. **Plan**: Create `TODO.md`.
2. **Generate**: Scaffolding files and directories.
3. **Run**: Execute install & build commands in terminal.
4. **Iterate**: Fix build errors, ask for clarifications if blocker.
5. **Finish**: Ensure `npm run dev` starts local server; `npm run deploy` pushes to GitHub Pages and PWA installs successfully.
