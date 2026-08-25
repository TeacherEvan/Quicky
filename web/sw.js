/* Quicky offline shell.
 *
 * Strategy:
 *  - Navigations and main.dart.js: network-first (deploys go live instantly),
 *    falling back to the cache when offline.
 *  - Other same-origin GETs (assets, fonts): stale-while-revalidate.
 * Cross-origin requests (Convex, Open-Meteo, Overpass, gstatic CanvasKit) are
 * left to the network / their own caches.
 */
const CACHE = 'quicky-v1';
// Network-first: the shell, the bundle, and versioned assets (fonts, intro
// video) must never play one deploy behind. Cache answers only when offline.
const NETWORK_FIRST = [
  '/',
  '/index.html',
  '/main.dart.js',
  '/flutter_bootstrap.js',
  '/assets/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['/'])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const networkFirst = NETWORK_FIRST.includes(url.pathname) || req.mode === 'navigate';

  if (networkFirst) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('/')),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const fetchAndPut = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => hit);
      return hit || fetchAndPut;
    }),
  );
});
