self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => {
      self.registration.unregister();
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Pass through all requests directly to the network
  const fetchOptions = e.request.method === 'GET' ? { cache: 'no-store' } : undefined;
  e.respondWith(fetch(e.request, fetchOptions));
});
