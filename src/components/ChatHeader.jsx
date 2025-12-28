import React from 'react';
import './ChatHeader.css';
import { useChat } from '../context/ChatContext';

export const ChatHeader = ({ user, isConnected, onLogout }) => {
  const { onlineStatus } = useChat();

  // Determine the other user
  const otherUserId = user?.userId === '1111' ? '6910' : '1111';
  const isOtherUserOnline = onlineStatus[otherUserId] || false;
  const isCurrentUserOnline = onlineStatus[user?.userId] || false;
  
  const userNames = {
    '1111': 'Abhinav 🎀',
    '6910': 'Adiuu Ji 💗🎀',
  };
  
  const otherUserName = userNames[otherUserId] || otherUserId;

  return (
    <header className="chat-header">
      <div className="header-content">
        <div className="header-info">
          <h2 className="header-title">{otherUserName}</h2>
          <div className="status-info">
            <span className={`online-indicator ${isOtherUserOnline ? 'online' : 'offline'}`} />
            <span className={`status-text ${isOtherUserOnline ? 'online' : 'offline'}`}>
              {isOtherUserOnline ? '● Online' : '○ Offline'}
            </span>
            {isCurrentUserOnline && (
              <span className="you-indicator">You ●</span>
            )}
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Exit
        </button>
      </div>
    </header>
  );
};
