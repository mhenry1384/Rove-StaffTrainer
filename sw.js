// Service worker: makes the app installable and lets it work offline.
//
// Strategy: network first, cache as fallback. When online, every file comes
// fresh from the server (so pushed changes show up on the next load, with no
// version number to bump) and the cached copy is refreshed. When offline, or
// when the network takes longer than NETWORK_TIMEOUT_MS, the cached copy is used.

const CACHE = "staff-trainer";
const NETWORK_TIMEOUT_MS = 3000;

// Everything the app needs to run offline, cached on install.
// When you add a file the app needs, add it here too.
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  // Store pages under their path without the query string.
  const url = new URL(req.url);
  url.search = "";
  const key = req.mode === "navigate" ? url.href : req;

  // Skip the browser's HTTP cache so we really get the latest version.
  const network = fetch(req, { cache: "no-cache" }).then((res) => {
    if (res.ok && res.status === 200) cache.put(key, res.clone());
    return res;
  });
  network.catch(() => {}); // Failures are handled below.

  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS));
  try {
    const res = await Promise.race([network, timeout]);
    if (res) return res;
  } catch (e) {
    // Offline: fall through to the cache.
  }

  const cached = await cache.match(key, { ignoreSearch: true });
  if (cached) return cached;
  return network; // Nothing cached: keep waiting on the network.
}
