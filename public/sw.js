// Quicky service worker — vanilla JS, no build step.
// Cache name: quicky-v1

const CACHE = "quicky-v1";

const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.json",
  "/icons/Icon-192.png",
  "/icons/Icon-512.png",
  "/icons/Icon-maskable-192.png",
  "/icons/Icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Pre-cache assets individually so one failure doesn't block the rest.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => {
            // ignore — runtime strategy will still fetch
          }),
        ),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event && event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isCacheFirstAsset(url) {
  return (
    url.pathname === "/offline.html" ||
    url.pathname === "/manifest.json" ||
    url.pathname.startsWith("/icons/")
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isNextBundle(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/main/");
}

function isNavigation(request) {
  if (request.mode === "navigate") return true;
  if (request.method !== "GET") return false;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Convex /api calls: network-only, never cache. Data must be live.
  if (isApiRequest(url)) {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  // Cache-first for app shell static assets.
  if (isCacheFirstAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return response;
          })
          .catch(() => caches.match("/offline.html"));
      }),
    );
    return;
  }

  // Stale-while-revalidate for Next.js bundle.
  if (isNextBundle(url)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((response) => {
              if (response && response.ok) {
                const copy = response.clone();
                cache.put(request, copy);
              }
              return response;
            })
            .catch(() => cached || Response.error());
          return cached || network;
        }),
      ),
    );
    return;
  }

  // Navigation: network-first, fall back to cache, then offline page.
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match("/offline.html");
          if (offline) return offline;
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }),
    );
    return;
  }

  // Default: try network, fall back to cache.
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});
