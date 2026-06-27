// VegVita Service Worker — PWA + Background Notifications

const CACHE_NAME = "vegvita-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// Push notification received
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "VegVita", {
      body: data.body || "Time to eat healthy!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "vegvita-reminder",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: "/" },
    })
  );
});

// Notification click — open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus();
      return clients.openWindow("/");
    })
  );
});

// Schedule local notifications via setTimeout messages
self.addEventListener("message", (event) => {
  if (event.data?.type === "SCHEDULE_NOTIFICATIONS") {
    const meals = event.data.meals;
    meals.forEach(({ title, body, delay }) => {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: `meal-${Date.now()}`,
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: "/" },
        });
      }, delay);
    });
  }
});
