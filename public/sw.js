const CACHE = "personal-os-v1";
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
  // Only cache GET navigation requests; pass through API/Next.js internals
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/_next/") || e.request.url.includes("/api/")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        if (res.ok && e.request.mode === "navigate") {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        }
        return res;
      });
      return cached ?? network;
    })
  );
});
