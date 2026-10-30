/* PHEME service worker — fast repeat visits and offline reading */
const VERSION = 'pheme-edition-3';
const PRECACHE = ['./', './index.html', './styles.css', './app.js', './news-engine.js', './news/stories.json', './icon.svg', './manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pheme-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(VERSION).then(cache => cache.put('./index.html', copy));
      }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Both editorial data and application scripts must be network-first, so fixes ship immediately.
  const path = new URL(event.request.url).pathname;
  const isFeed = path.endsWith('/news/stories.json') || path.endsWith('/news-engine.js') ||
      path.endsWith('/app.js') || path.endsWith('/styles.css');
  if (isFeed) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(VERSION).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(VERSION).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});