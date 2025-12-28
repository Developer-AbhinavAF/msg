import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ChatContext = createContext();

const CHUNK_SIZE = 25;

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingStatus, setTypingStatus] = useState({});
  const [onlineStatus, setOnlineStatus] = useState({});
  const [lastSeenStatus, setLastSeenStatus] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const loadingRef = useRef(false);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Add new message
  const addMessage = useCallback((message) => {
    console.log('📝 Adding message to context:', message.messageId);
    setMessages((prev) => {
      // Check if message already exists
      const exists = prev.some((m) => m.messageId === message.messageId);
      if (exists) {
        console.log('⚠️ Message already exists, skipping:', message.messageId);
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(
    (fetchFunction) => {
      if (loadingRef.current || !hasMoreMessages) return;

      loadingRef.current = true;
      setLoading(true);

      const offset = messages.length;
      Promise.resolve(fetchFunction(offset, CHUNK_SIZE))
        .then((newMessages) => {
          if (!newMessages || newMessages.length === 0) {
            setHasMoreMessages(false);
            return;
          }
          if (newMessages.length < CHUNK_SIZE) {
            setHasMoreMessages(false);
          }
          setMessages((prev) => [...newMessages, ...prev]);
        })
        .catch((err) => {
          console.error('Failed to load messages:', err);
          setHasMoreMessages(false);
        })
        .finally(() => {
          loadingRef.current = false;
          setLoading(false);
        });
    },
    [messages.length, hasMoreMessages]
  );

  // Update message (e.g., reactions, read status)
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.messageId === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.messageId !== messageId));
  }, []);

  // Clear messages (on logout)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setHasMoreMessages(true);
    loadingRef.current = false;
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        roomData,
        setRoomData,
        loading,
        hasMoreMessages,
        typingStatus,
        setTypingStatus,
        onlineStatus,
        setOnlineStatus,
        lastSeenStatus,
        setLastSeenStatus,
        replyingTo,
        setReplyingTo,
        addMessage,
        loadMoreMessages,
        updateMessage,
        deleteMessage,
        clearMessages,
        messagesEndRef,
        CHUNK_SIZE,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
