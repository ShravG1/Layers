import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Layers',
        short_name: 'Layers',
        description: 'Smart layer recommendations based on live weather and how you actually feel',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        importScripts: ['/push-handler.js'],
        // Don't intercept external API calls — let the browser handle them.
        // When NetworkFirst has no cache and the network fails it throws a fatal
        // "no-response" error that kills the whole fetch rather than letting the
        // app's own error handling take over.
        navigateFallback: '/index.html',
      },
    }),
  ],
})
