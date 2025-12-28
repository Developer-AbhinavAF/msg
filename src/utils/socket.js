import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (roomId, userId) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    query: { roomId, userId },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event emitters
export const emitMessage = (messageData) => {
  if (socket) {
    console.log('📤 Emitting message:', messageData);
    socket.emit('message:send', messageData);
  }
};

export const emitTyping = (isTyping) => {
  if (socket) {
    socket.emit('typing:update', { isTyping });
  }
};

export const emitReaction = (messageId, emoji) => {
  if (socket) {
    socket.emit('reaction:add', { messageId, emoji });
  }
};

export const emitReadReceipt = (messageIds) => {
  if (socket) {
    socket.emit('message:read', { messageIds: Array.isArray(messageIds) ? messageIds : [messageIds] });
  }
};

export const emitVoiceMessage = (audioBase64, duration, senderName = '') => {
  if (socket) {
    socket.emit('voice:send', { audioBase64, duration, senderName });
  }
};

export const emitAttachment = (filename, fileBase64, fileType, fileSize, senderName = '') => {
  if (socket) {
    socket.emit('attachment:send', { filename, fileBase64, fileType, fileSize, senderName });
  }
};

export const emitPollCreate = (question, options) => {
  if (socket) {
    socket.emit('poll:create', { question, options });
  }
};

export const emitPollVote = (messageId, optionIndex) => {
  if (socket) {
    socket.emit('poll:vote', { messageId, optionIndex });
  }
};

export const emitEditMessage = (messageId, newContent) => {
  if (socket) {
    socket.emit('message:edit', { messageId, newContent });
  }
};

export const emitDeleteMessage = (messageId, deleteForEveryone = false) => {
  if (socket) {
    socket.emit('message:delete', { messageId, deleteForEveryone });
  }
};

// Socket event listeners
export const onMessageReceived = (callback) => {
  if (socket) {
    socket.on('message:received', (data) => {
      console.log('✓ Message received:', data.message);
      callback(data);
    });
  }
};

export const onTypingUpdate = (callback) => {
  if (socket) {
    socket.on('typing:update', callback);
  }
};

export const onReactionUpdated = (callback) => {
  if (socket) {
    socket.on('reaction:updated', (data) => {
      console.log('✓ Reaction updated:', data);
      callback(data);
    });
  }
};

export const onUserOnline = (callback) => {
  if (socket) {
    socket.on('user:online', (data) => {
      console.log('✓ User online:', data);
      callback(data);
    });
  }
};

export const onUserOffline = (callback) => {
  if (socket) {
    socket.on('user:offline', (data) => {
      console.log('✓ User offline:', data);
      callback(data);
    });
  }
};

export const onPollUpdated = (callback) => {
  if (socket) {
    socket.on('poll:updated', (data) => {
      console.log('✓ Poll updated:', data);
      callback(data);
    });
  }
};

export const onMessageRead = (callback) => {
  if (socket) {
    socket.on('message:read', (data) => {
      console.log('✓ Message read receipt:', data);
      callback(data);
    });
  }
};

export const onMessageEdited = (callback) => {
  if (socket) {
    socket.on('message:edited', (data) => {
      console.log('✓ Message edited:', data);
      callback(data);
    });
  }
};

export const onMessageDeleted = (callback) => {
  if (socket) {
    socket.on('message:deleted', (data) => {
      console.log('✓ Message deleted:', data);
      callback(data);
    });
  }
};

export const offEvent = (event) => {
  if (socket) {
    socket.off(event);
  }
};
