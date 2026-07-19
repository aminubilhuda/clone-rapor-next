/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// Custom service worker logic injected into the next-pwa generated sw.js.
// Handles push notifications and notification clicks. Caching/runtime caching
// is configured in next.config.ts (workboxOptions).

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: { title?: string; body?: string; url?: string };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "E-Rapor", body: event.data.text() };
  }

  const title = payload.title || "E-Rapor SMK Abdi Negara";
  const options: NotificationOptions & { data?: { url?: string } } = {
    body: payload.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (sw.clients as any)
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList: any[]) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return (sw.clients as any).openWindow(targetUrl);
      })
  );
});
