
const CACHE_NAME = 'jd-survey-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar el service worker y cachear archivos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Estrategia: Primero red, si falla, caché (Network First)
// Ideal para encuestas donde queremos datos frescos pero que funcione offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
