import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../utils/api';
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  emitMessage,
  onMessageReceived,
  onTypingUpdate,
  onReactionUpdated,
  onPollUpdated,
  onMessageEdited,
  onMessageDeleted,
  onMessageRead,
} from '../utils/socket';
import { requestNotificationPermission, sendMessageNotification } from '../utils/notification';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { ChatHeader } from '../components/ChatHeader';

export const ChatPage = ({ onLogout }) => {
  const { user } = useAuth();
  const {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    onlineStatus,
    setOnlineStatus,
    lastSeenStatus,
    setLastSeenStatus,
    typingStatus,
    setTypingStatus,
  } = useChat();
  const [isConnected, setIsConnected] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState({});
  const socketRef = useRef(null);

  // Request notification permission
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Screen lock detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Screen locked or tab hidden - redirect to Instagram
        console.log('Screen locked or tab hidden - redirecting to Instagram Reels');
        window.location.href = 'https://www.instagram.com/reels/';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const storedRoomId = localStorage.getItem('roomId');
    const userId = user?.userId;
    
    if (!storedRoomId || !userId) {
      console.warn('Missing roomId or userId', { storedRoomId, userId });
      return;
    }

    console.log('🔌 Initializing ChatPage with userId:', userId, 'roomId:', storedRoomId);

    // Initialize socket
    socketRef.current = initializeSocket(storedRoomId, userId);
    console.log('🔌 Socket initialized for user:', userId);

    // Listen for incoming messages
    onMessageReceived((data) => {
      console.log('📨 Received message:', data.message);
      addMessage(data.message);
      
      // Send notification if it's from the other user
      if (data.message.senderId !== user?.userId) {
        const messagePreview = data.message.content?.substring(0, 50) || 'New message';
        sendMessageNotification(data.message.senderName || 'User', messagePreview);
      }
    });

    // Listen for online status updates
    const socket = getSocket();
    if (socket) {
      socket.on('user:online', (data) => {
        console.log('✓ User online:', data);
        setOnlineStatus((prev) => ({
          ...prev,
          [data.userId]: true,
        }));
      });

      socket.on('user:offline', (data) => {
        console.log('✗ User offline:', data);
        setOnlineStatus((prev) => ({
          ...prev,
          [data.userId]: false,
        }));
        // Update last seen time when user goes offline
        if (data.lastSeen) {
          setLastSeenStatus((prev) => ({
            ...prev,
            [data.userId]: data.lastSeen,
          }));
        }
      });
    }

    // Listen for typing updates
    onTypingUpdate((data) => {
      console.log('⌨️ User typing:', data);
      
      // Clear previous timeout for this user
      if (typingTimeout[data.userId]) {
        clearTimeout(typingTimeout[data.userId]);
      }
      
      setTypingStatus((prev) => ({
        ...prev,
        [data.userId]: data.isTyping,
      }));

      // Set timeout to clear typing after 16 seconds
      if (data.isTyping) {
        const timeout = setTimeout(() => {
          setTypingStatus((prev) => ({
            ...prev,
            [data.userId]: false,
          }));
        }, 16000);

        setTypingTimeout((prev) => ({
          ...prev,
          [data.userId]: timeout,
        }));
      }
    });

    // Listen for reaction updates
    onReactionUpdated((data) => {
      console.log('😊 Reaction updated:', data);
      updateMessage(data.messageId, {
        reactions: data.reactions,
      });
    });

    // Listen for poll updates
    onPollUpdated((data) => {
      console.log('📊 Poll updated:', data);
      updateMessage(data.messageId, {
        poll: data.poll,
      });
    });

    // Listen for message edits
    onMessageEdited((data) => {
      console.log('✏️ Message edited:', data);
      updateMessage(data.messageId, {
        content: data.content,
        isEdited: data.isEdited,
        editedAt: data.editedAt,
      });
    });

    // Listen for message deletes
    onMessageDeleted((data) => {
      console.log('🗑️ Message deleted:', data);
      if (data.deletedFor === 'everyone') {
        updateMessage(data.messageId, {
          isDeletedForEveryone: true,
          content: '[This message was deleted]',
        });
      } else {
        deleteMessage(data.messageId);
      }
    });

    // Listen for read receipts
    onMessageRead((data) => {
      console.log('✓✓ Message read:', data);
      data.messageIds.forEach((messageId) => {
        updateMessage(messageId, {
          status: 'read',
        });
      });
    });

    setIsConnected(true);

    // Fetch ALL initial messages
    const fetchInitialMessages = async () => {
      try {
        const res = await chatAPI.getMessages(storedRoomId, 0, 1000);
        console.log('✓ Loaded', res.data.messages.length, 'messages from DB');
        if (res.data.messages && res.data.messages.length > 0) {
          // Add all messages at once to the context
          res.data.messages.forEach((msg) => addMessage(msg));
          console.log('✓ All messages loaded and rendered');
        } else {
          console.log('No messages found in database');
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    // Call fetch immediately
    fetchInitialMessages();

    return () => {
      disconnectSocket();
    };
  }, [user?.userId, addMessage, updateMessage, deleteMessage, setOnlineStatus, setTypingStatus]);

  const getTypingMessage = () => {
    const otherUserId = user?.userId === '1111' ? '6910' : '1111';
    const isTyping = typingStatus[otherUserId];

    if (!isTyping) return null;

    // Get user display name
    const userNames = {
      '1111': 'Abhinav 🎀',
      '6910': 'Adiuu Ji 💗🎀',
    };

    const typingUserName = userNames[otherUserId] || otherUserId;
    
    // Check if typing for more than 20 seconds
    if (typingTimeout[otherUserId]) {
      return `I think ${typingUserName} is writing Mahabharat/Ramayan`;
    }

    return `${typingUserName} is typing`;
  };

  const handleSendMessage = (messageData) => {
    console.log('📤 Sending message:', messageData);
    emitMessage({
      ...messageData,
      senderName: user?.senderName || user?.userId,
    });
  };

  return (
    <div className="chat-container">
      <ChatHeader user={user} isConnected={isConnected} onLogout={onLogout} />
      <MessageList messages={messages} currentUserId={user?.userId} onlineStatus={onlineStatus} typingStatus={typingStatus} />
      {getTypingMessage() && (
        <div className="typing-indicator">
          <span>{getTypingMessage()}</span>
          <span className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
      )}
      <MessageInput onSendMessage={handleSendMessage} senderName={user?.senderName || user?.userId} />
    </div>
  );
};
