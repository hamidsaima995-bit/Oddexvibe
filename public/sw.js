// ODDEX VIBE service worker — enables offline play + fast repeat loads.
// Strategy: "network-first, fall back to cache" for the app shell, so users
// always get the latest version when online, but the game still opens offline.

const CACHE_NAME = "oddexvibe-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
];

// On install: pre-cache the core app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// On activate: clean up old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// On fetch: try the network first (fresh content), fall back to cache (offline)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle GET requests; let everything else (e.g. Supabase POSTs) pass through
  if (req.method !== "GET") return;

  // Never cache Supabase / analytics / external API calls — those need live network
  const url = new URL(req.url);
  const isExternalApi =
    url.hostname.includes("supabase") ||
    url.hostname.includes("google-analytics") ||
    url.hostname.includes("googletagmanager") ||
    url.hostname.includes("analytics");
  if (isExternalApi) return; // let the browser handle it normally

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cache a copy of successful same-origin responses for offline use
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        // Offline: serve from cache; fall back to index.html for navigations
        caches.match(req).then((cached) => cached || caches.match("/index.html"))
      )
  );
});
