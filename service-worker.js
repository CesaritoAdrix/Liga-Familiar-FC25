const CACHE_NAME = "liga-fc25-cache-julio-1-2026";
const urlsToCache = [
  "./",
  //"./index.html",
  //"./styles.css"
  //"./manifest.json",
];

// Instalar SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activar SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Evita cachear los JSON y CSV
  if (url.pathname.endsWith(".json") || url.pathname.endsWith(".csv")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para todo lo demás, servir cache o red
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match("./index.html"));
    })
  );
});
