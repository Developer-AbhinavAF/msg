import React, { useEffect, useRef, useState } from 'react';
import './MessageList.css';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../context/ChatContext';
import { chatAPI } from '../utils/api';

export const MessageList = ({ messages, currentUserId, onlineStatus, typingStatus }) => {
  const { loading, hasMoreMessages, loadMoreMessages, messagesEndRef } = useChat();
  const messageListRef = useRef(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  useEffect(() => {
    // Only scroll to bottom if new messages were added (not when loading old ones)
    if (messages.length > previousMessageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setPreviousMessageCount(messages.length);
  }, [messages.length, previousMessageCount]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    // Load more messages when user scrolls to top
    if (scrollTop === 0 && hasMoreMessages && !loading) {
      const roomId = localStorage.getItem('roomId');
      loadMoreMessages((offset, limit) =>
        chatAPI
          .getMessages(roomId, offset, limit)
          .then((res) => res.data.messages || [])
          .catch((err) => {
            console.error('Failed to fetch messages:', err);
            return [];
          })
      );
    }
  };

  return (
    <div className="message-list" onScroll={handleScroll} ref={messageListRef}>
      {loading && hasMoreMessages && (
        <div className="chunk-loading">
          <div className="loading-spinner" />
          <p>Loading older messages...</p>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet.</p>
          <p className="empty-subtitle">Start a conversation</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.messageId}
            message={message}
            isSent={message.senderId === currentUserId}
            currentUserId={currentUserId}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
