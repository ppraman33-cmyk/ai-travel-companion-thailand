const SHELL_CACHE = "atct-shell-v1";
const SHELL_PATHS = ["/", "/explore", "/food", "/events", "/trips", "/help"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_PATHS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/help")
  ) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((response) => response || caches.match("/")),
    ),
  );
});
