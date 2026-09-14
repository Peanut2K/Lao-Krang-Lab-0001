/*
 * Push handling for reviewers. No offline caching here — the archive is only
 * useful online (photos, line art and the queue all live on the server), so a
 * stale cache would be worse than a clear "no connection".
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "คลังลวดลายไทย", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "คลังลวดลายไทย", {
      body: payload.body || "",
      icon: payload.icon || "/icon-192.png",
      badge: "/badge-96.png",
      lang: "th",
      vibrate: [100, 50, 100],
      // One pattern submission should not bury the last: same tag replaces,
      // and the queue link is what the reviewer actually needs on tap.
      tag: payload.tag || "lai-thai",
      renotify: Boolean(payload.tag),
      data: { url: payload.url || "/admin" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin", self.location.origin).href;

  // Focus the tab the reviewer already has open rather than piling up windows.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      if (windows.length && "navigate" in windows[0]) {
        return windows[0].navigate(target).then((client) => client?.focus());
      }
      return self.clients.openWindow(target);
    }),
  );
});
