/**
 * Format timestamp to relative time like "5 min", "30 sec", "2 hrs"
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const secondsDiff = Math.floor((now - messageTime) / 1000);

  if (secondsDiff < 60) {
    return `${secondsDiff} sec`;
  }

  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) {
    return `${minutesDiff} min`;
  }

  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) {
    return `${hoursDiff} hrs`;
  }

  const daysDiff = Math.floor(hoursDiff / 24);
  return `${daysDiff}d`;
};

/**
 * Format voice message duration
 */
export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} min ${secs} sec`;
};

/**
 * Format exact time (HH:MM)
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get time edit window status - NO TIME LIMIT
 */
export const getEditableTime = (timestamp) => {
  // Allow editing anytime - no time limit
  return { isEditable: true, timeLeft: Infinity };
};
