const CACHE_NAME = "ahadu-academy-shell-v3";
const CACHE_PREFIX = "ahadu-academy-shell-";
const APP_SHELL = ["/", "/index.html", "/manifest.json", "/version.json", "/favicon.svg", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data?.type === "CLEAR_STALE_SHELL_CACHES") {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(
          keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        ))
        .then(() => event.ports?.[0]?.postMessage({ ok: true }))
        .catch(() => event.ports?.[0]?.postMessage({ ok: false }))
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache authenticated API data, uploads, or version checks.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/") || url.pathname.endsWith("/version.json")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      // Clone synchronously before returning the response to the page. Cache only
      // successful same-origin navigation responses; never cache API/error bodies.
      if (response.ok && !response.bodyUsed && response.type !== "opaque") {
        const cacheCopy = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => cache.put("/index.html", cacheCopy))
          .catch(() => undefined);
      }
      return response;
    }).catch(async () => (await caches.match("/index.html")) || (await caches.match("/"))));
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        // A failed asset response must not enter the app-shell cache. Clone before
        // yielding the original response, and treat storage failures as non-fatal.
        if (response.ok && !response.bodyUsed && response.type !== "opaque") {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, cacheCopy))
            .catch(() => undefined);
        }
        return response;
      });
      return cached || network;
    }));
  }
});
