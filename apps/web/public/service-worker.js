const CACHE_NAME = 'legalos-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/dashboard',
  '/cases',
  '/calendar',
  '/documents',
  '/reports',
  '/tasks',
  '/portal',
  '/ai-assistant',
];

// Install Event — Cache Critical Static Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static App Shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => console.log('[ServiceWorker] Static cache warning:', err));
    })
  );
  self.skipWaiting();
});

// Activate Event — Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Stale-While-Revalidate & Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET or chrome-extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, return cached response or offline shell
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync Handler for Offline Action Queues
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-legalos-offline-actions') {
    console.log('[ServiceWorker] Triggered background sync for offline actions');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' }));
      })
    );
  }
});

// Web Push Notification Listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'تنبيه جديد — LegalOS', body: 'يوجد تحديث في قضاياك' };
  const options = {
    body: data.body || 'تنبيه جديد من نظام المحاماة',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: '1', url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
