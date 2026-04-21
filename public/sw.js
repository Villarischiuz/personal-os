const CACHE = "personal-os-v2";
const SHELL = ["/dashboard", "/calendar", "/physical", "/work", "/study"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Pass through API calls and Next.js data fetches; cache static assets
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        if (res.ok && (e.request.mode === "navigate" || url.pathname.startsWith("/_next/static/"))) {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        }
        return res;
      });
      return cached ?? network;
    })
  );
});
