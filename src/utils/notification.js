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
 * Send a notification when a message is received
 */
export const sendMessageNotification = (senderName, messagePreview) => {
  console.log('📢 Trying to send notification. Permission:', Notification.permission);
  
  if (Notification.permission === 'granted') {
    try {
      console.log('📢 Sending notification from:', senderName);
      new Notification(`Message from ${senderName}`, {
        body: messagePreview || 'New message received',
        icon: '💬',
        badge: '💬',
        tag: 'message-notification',
        requireInteraction: false,
      });
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
