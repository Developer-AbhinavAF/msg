/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  return false;
};

/**
 * Send a notification when a message is received
 */
export const sendMessageNotification = (senderName, messagePreview) => {
  if (Notification.permission === 'granted') {
    try {
      new Notification(`Message from ${senderName}`, {
        body: messagePreview || 'New message received',
        icon: '💬',
        badge: '💬',
        tag: 'message-notification',
        requireInteraction: false,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
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
