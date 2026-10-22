const CACHE_NAME = "capcar-public-v5";
const PUBLIC_SHELL = [
  "/",
  "/roadmap",
  "/icon.svg",
  "/capcar-mark-192.png",
  "/capcar-mark.png",
];
const PRIVATE_PREFIXES = [
  "/ai",
  "/account",
  "/auth",
  "/forgot-password",
  "/garage",
  "/international-parts",
  "/launch",
  "/login",
  "/notifications",
  "/passport",
  "/register",
  "/reset-password",
  "/system",
  "/marketplace",
  "/verified-work",
  "/connected-parts",
];

function isPrivate(url) {
  return (
    PRIVATE_PREFIXES.some(
      (prefix) =>
        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
    ) || url.searchParams.has("_rsc")
  );
}

function canCacheResponse(response) {
  // Cache Storage ignores HTTP cache directives unless we enforce them here.
  return (
    response.ok &&
    !response.redirected &&
    !/\b(?:private|no-store|no-cache)\b/i.test(
      response.headers.get("cache-control") || "",
    ) &&
    !/(?:^|,)\s*(?:cookie|authorization|\*)\s*(?:,|$)/i.test(
      response.headers.get("vary") || "",
    )
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PUBLIC_SHELL.map(async (path) => {
          const response = await fetch(path);
          if (canCacheResponse(response)) await cache.put(path, response);
        }),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    request.headers.get("rsc") === "1" ||
    request.headers.has("authorization") ||
    isPrivate(url)
  )
    return;

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    ["font", "image", "script", "style"].includes(request.destination);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (canCacheResponse(response)) {
              const copy = response.clone();
              void caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (canCacheResponse(response)) {
            const copy = response.clone();
            void caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notifications";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find(
          (client) => new URL(client.url).origin === self.location.origin,
        );
        if (existing) {
          existing.navigate(url);
          return existing.focus();
        }
        return self.clients.openWindow(url);
      }),
  );
});
