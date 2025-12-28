// Service Worker for Push Notifications
console.log('Service Worker loaded');

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'New Message',
    body: 'You have a new message',
    icon: '💬',
    badge: '💬',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: `Message from ${data.senderName || 'User'}`,
        body: data.message || 'New message received',
        icon: '💬',
        badge: '💬',
        tag: 'message-notification',
        requireInteraction: true,
        data: {
          url: '/',
        },
      };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: '💬',
      badge: '💬',
      tag: notificationData.tag || 'notification',
      requireInteraction: true,
      data: notificationData.data,
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if the app window is already open
        for (let client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});
