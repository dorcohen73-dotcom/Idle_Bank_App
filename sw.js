const CACHE_NAME = 'bank-empire-v1.2.5';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './audio.js',
  './locales.js',
  './economy-manager.js',
  './save-manager.js',
  './mission-controller.js',
  './game.js',
  './ui-draw.js',
  './ui-tabs.js',
  './ui-events.js',
  './app.js',
  './privacy.html',
  './תמונות/icon.png',
  './תמונות/icon-192.png',
  './תמונות/gold-chest.png',
  './תמונות/gold-truck.png',
  './תמונות/gold-vip.png',
  './תמונות/gold-bars.png',
  './תמונות/client-1.png',
  './תמונות/client-2.png',
  './תמונות/client-3.png',
  './תמונות/client-4.png',
  './תמונות/client-5.png',
  './תמונות/client-6.png',
  './תמונות/client-7.png',
  './תמונות/client-8.png',
  './תמונות/client-9.png',
  './תמונות/client-10.png',
  './תמונות/vault.png',
  './תמונות/vault-door.png',
  './תמונות/teller-1.png',
  './תמונות/teller-2.png',
  './תמונות/teller-3.png',
  './תמונות/teller-4.png',
  './תמונות/teller-5.png',
  './תמונות/teller-6.png',
  './תמונות/teller-7.png',
  './תמונות/teller-8.png',
  './תמונות/manager-1.png',
  './תמונות/manager-2.png',
  './תמונות/manager-3.png',
  './תמונות/manager-4.png',
  './תמונות/manager-5.png',
  './תמונות/manager-6.png',
  './תמונות/guard.png',
  './תמונות/branch-bg-1.png',
  './תמונות/branch-bg-2.png',
  './תמונות/branch-bg-3.png',
  './תמונות/branch-bg-4.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn(`Failed to cache asset ${url}:`, err))
        )
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isMediaOrAsset = url.pathname.endsWith('.png') || 
                         url.pathname.endsWith('.jpg') || 
                         url.pathname.endsWith('.mp3') || 
                         url.pathname.endsWith('.wav');
  
  if (isMediaOrAsset) {
    // Cache First strategy for media assets
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, response.clone());
            return response;
          });
        });
      })
    );
  } else {
    // Network First strategy for HTML, JS, CSS, JSON, manifest
    // Set cache: 'reload' for GET requests to bypass browser cache and hit the network
    const fetchOptions = e.request.method === 'GET' ? { cache: 'reload' } : undefined;
    e.respondWith(
      fetch(e.request, fetchOptions)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
            return response;
          }
          // Fall back to cache on server errors (e.g. 500/404)
          return caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || response;
          });
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
  }
});
