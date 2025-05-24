import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/grocery-list/' : '/',
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
            urlPattern: /^https:\/\/api\./,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Grocery List',
        short_name: 'GroceryList',
        description: 'A no-sign-in shopping list that stores items locally and syncs when online',
        theme_color: '#10b981',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/grocery-list/',
        start_url: '/grocery-list/',
        icons: [
          {
            src: '/grocery-list/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/grocery-list/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
