/**
 * Register Service Worker for push notifications
 */
export const registerServiceWorker = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ This browser does not support Service Workers');
      return false;
    }

    console.log('📝 Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });
    console.log('✓ Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('❌ This browser does not support notifications');
    return false;
  }

  console.log('📢 Current notification permission:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log('✓ Notifications already enabled');
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      console.log('📢 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('📢 Notification permission result:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  console.log('❌ Notifications are blocked by the user');
  return false;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push notifications not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    console.log('📢 Subscribing to push notifications...');

    // For demo purposes, we'll use simulated push
    // In production, you'd connect to a push service
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'AQAB'
      ), // Dummy key for demo
    }).catch(() => {
      // If push subscription fails, return null but don't error
      console.log('⚠️ Push subscription not available (normal for development)');
      return null;
    });

    if (subscription) {
      console.log('✓ Subscribed to push notifications:', subscription);
      return subscription;
    }
    return null;
  } catch (error) {
    console.error('❌ Push subscription error:', error);
    return null;
  }
};

/**
 * Convert base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('Error converting base64:', error);
    return new Uint8Array();
  }
}

/**
 * Send a notification when a message is received
 */
export const sendMessageNotification = (senderName, messagePreview) => {
  console.log('📢 Trying to send notification. Permission:', Notification.permission);
  
  if (Notification.permission === 'granted') {
    try {
      console.log('📢 Sending notification from:', senderName);
      
      // Try using Service Worker notification first (works when site closed)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        console.log('📢 Sending via Service Worker');
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          senderName,
          message: messagePreview,
        });
      } else {
        // Fallback to regular notification
        console.log('📢 Sending regular notification');
        new Notification(`Message from ${senderName}`, {
          body: messagePreview || 'New message received',
          icon: '💬',
          badge: '💬',
          tag: 'message-notification',
          requireInteraction: true,
        });
      }
      console.log('✓ Notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  } else {
    console.log('❌ Cannot send notification - permission not granted. Current:', Notification.permission);
  }
};

/**
 * Format last seen time
 */
export const formatLastSeen = (lastSeenDate) => {
  if (!lastSeenDate) return 'Never';

  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffMs = now - lastSeen;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Format as date
  return lastSeen.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
