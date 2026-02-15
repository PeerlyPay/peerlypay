self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body,
      // Use the actual icons from your directory
      icon: data.icon || '/icons/peerly/192.png',
      // BADGE: Android requires a purely monochrome (white with transparent background)
      // icon for the status bar. You need to create this!
      // Do not use the magenta block here, it will just show as a solid white square.
      badge: data.badge || '/icons/peerly/badge-monochrome.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'peerlypay-update', // Prevents spamming the user with duplicate alerts
      data: {
        // Pass the exact URL to navigate to when clicked
        url: data.url || '/orders',
      },
      // Give them quick actions right from the lock screen
      actions: data.actions || [
        { action: 'view_trade', title: 'View Trade' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'PeerlyPay Update', options)
    );
  } catch (err) {
    console.error('Error parsing push notification data:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Extract the dynamic URL we passed in the push event
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. If the user already has the app open, focus that tab and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // 2. If the app is closed, open a new window directly to the target URL
      if (clients.openWindow) {
        // Fallback to origin if no URL was provided
        return clients.openWindow(urlToOpen || self.location.origin);
      }
    })
  );
});
