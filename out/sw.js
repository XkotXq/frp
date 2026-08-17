const CACHE_NAME = "frp-checker-v2";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}

					return Promise.resolve();
				}),
			),
		),
	);
	self.clients.claim();
});

// Network-first: always serve the latest deploy when online, fall back to
// cache only when offline. Cache-first was serving stale builds forever
// because CACHE_NAME never changed between deployments.
self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((networkResponse) => {
				const responseClone = networkResponse.clone();
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, responseClone);
				});
				return networkResponse;
			})
			.catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
	);
});
