// Push notification handler — imported into the workbox-generated service worker.
self.addEventListener('push', (e) => {
  let data = { title: 'Layers', body: "Check today's outfit." }
  try {
    if (e.data) data = { ...data, ...e.data.json() }
  } catch { /* malformed payload — fall back to defaults */ }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
      data:  { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const target = e.notification.data?.url ?? '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(target) && 'focus' in c) return c.focus()
      }
      return self.clients.openWindow(target)
    })
  )
})
