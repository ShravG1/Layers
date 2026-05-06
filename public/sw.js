// Service Worker for WhatToWear PWA
// Handles: install, activate, fetch caching, push notifications

const CACHE_NAME = 'wtw-v1'
const STATIC_ASSETS = ['/', '/index.html']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  // Network-first for API calls
  if (e.request.url.includes('open-meteo.com')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone))
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})

// Push notification handler
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? { title: 'WhatToWear', body: 'Check today\'s outfit recommendation' }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.openWindow('/'))
})

// Message handler for scheduling daily notifications
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = e.data
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon:  '/icon-192.png',
        badge: '/icon-192.png',
      })
    }, delay ?? 0)
  }
})
