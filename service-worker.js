self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("info-tech-cache").then((cache) =>
      cache.addAll([
        "/index.html",
        "/情報技術II/index.html",
        "/情報技術III/index.html"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
