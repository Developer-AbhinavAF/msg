import React, { useState, useRef, useEffect } from 'react';
import './MessageBubble.css';
import { formatDuration, formatTime, getEditableTime } from '../utils/timeFormat';
import { emitReaction, emitEditMessage, emitDeleteMessage, emitReadReceipt } from '../utils/socket';
import { useChat } from '../context/ChatContext';
import { ReactionPicker } from './ReactionPicker';

export const MessageBubble = ({ message, isSent, currentUserId, onlineStatus }) => {
  const { setReplyingTo } = useChat();
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReplyMenu, setShowReplyMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const messageRef = useRef(null);

  const { isEditable } = getEditableTime(message.timestamp);

  useEffect(() => {
    // Mark message as read
    if (message.senderId !== currentUserId && !message.readBy?.includes(currentUserId)) {
      setTimeout(() => {
        emitReadReceipt(message.messageId);
      }, 500);
    }
  }, [message, currentUserId]);

  const handleAddReaction = (emoji) => {
    console.log('😊 Adding reaction:', emoji, 'to message:', message.messageId);
    emitReaction(message.messageId, emoji);
    setShowReactions(false);
  };

  const handleEditMessage = () => {
    if (!isEditable) return;

    if (editedContent.trim() !== message.content) {
      emitEditMessage(message.messageId, editedContent.trim());
    }
    setIsEditing(false);
    setShowOptions(false);
  };

  const handleDeleteMessage = (forEveryone = false) => {
    if (confirm(forEveryone ? 'Delete for everyone?' : 'Delete from your chat?')) {
      emitDeleteMessage(message.messageId, forEveryone);
      setShowOptions(false);
    }
  };

  const handleReply = () => {
    setReplyingTo({
      messageId: message.messageId,
      content: message.content,
      senderName: message.senderName || 'Unknown',
    });
    setShowReplyMenu(false);
  };

  const renderStatusIndicators = () => {
    if (!isSent) return null;

    // Double blue tick for read
    if (message.status === 'read') {
      return <span className="message-status read">✓✓</span>;
    }

    // Double tick for delivered
    if (message.status === 'delivered') {
      return <span className="message-status delivered">✓✓</span>;
    }

    // Single tick for sent
    return <span className="message-status sent">✓</span>;
  };

  const renderContent = () => {
    // Handle deleted messages
    if (message.isDeletedForEveryone) {
      return <p className="message-content deleted">[This message was deleted]</p>;
    }

    if (isEditing) {
      return (
        <div className="edit-container">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
            autoFocus
          />
          <div className="edit-actions">
            <button className="edit-save" onClick={handleEditMessage}>
              Save
            </button>
            <button className="edit-cancel" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (message.type === 'voice') {
      return (
        <div className="voice-message">
          <audio controls style={{ maxWidth: '200px' }}>
            <source src={`data:audio/wav;base64,${message.content}`} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          <span className="voice-duration">{formatDuration(message.duration)}</span>
          <a 
            href={`data:audio/wav;base64,${message.content}`} 
            download={`voice-${message.messageId}.wav`}
            className="download-link"
            title="Download voice message"
          >
            ⬇️
          </a>
        </div>
      );
    }

    if (message.type === 'image') {
      return (
        <div className="image-message">
          <img 
            src={`data:image/jpeg;base64,${message.content}`} 
            alt="Shared image"
            className="message-image"
          />
          <a 
            href={`data:image/jpeg;base64,${message.content}`} 
            download={message.mediaUrl || `image-${message.messageId}.jpg`}
            className="download-link"
            title="Download image"
          >
            ⬇️
          </a>
        </div>
      );
    }

    if (message.type === 'video') {
      return (
        <div className="video-message">
          <video controls style={{ maxWidth: '300px', borderRadius: '8px' }}>
            <source src={`data:video/mp4;base64,${message.content}`} type="video/mp4" />
            Your browser does not support the video element.
          </video>
          <a 
            href={`data:video/mp4;base64,${message.content}`} 
            download={message.mediaUrl || `video-${message.messageId}.mp4`}
            className="download-link"
            title="Download video"
          >
            ⬇️
          </a>
        </div>
      );
    }

    if (message.type === 'file') {
      return (
        <div className="file-message">
          <a href={`data:application/octet-stream;base64,${message.content}`} download={message.mediaUrl || `file-${message.messageId}`}>
            📎 {message.mediaUrl}
          </a>
        </div>
      );
    }

    if (message.type === 'poll') {
      const poll = message.poll || JSON.parse(message.content);
      return (
        <div className="poll-message">
          <h4>{poll.question}</h4>
          {poll.options.map((option, idx) => (
            <div key={idx} className="poll-option">
              <button onClick={() => console.log('Vote on', idx)}>
                {option.text}
              </button>
              <span className="vote-count">{option.votes?.length || 0} votes</span>
            </div>
          ))}
        </div>
      );
    }

    // Handle reply
    if (message.replyTo) {
      let replyIcon = '💬';
      let replyContent = message.replyTo.content;
      
      // Detect if replying to media
      if (message.replyTo.type === 'image') {
        replyIcon = '🖼️';
        replyContent = `${replyIcon} Image`;
      } else if (message.replyTo.type === 'video') {
        replyIcon = '🎬';
        replyContent = `${replyIcon} Video`;
      } else if (message.replyTo.type === 'voice') {
        replyIcon = '🎤';
        replyContent = `${replyIcon} Voice message`;
      } else if (message.replyTo.type === 'file') {
        replyIcon = '📎';
        replyContent = `${replyIcon} ${message.replyTo.mediaUrl || 'File'}`;
      }
      
      return (
        <div className="message-wrapper-with-reply">
          <div className="reply-quote">
            <div className="reply-author">{message.replyTo.senderName}</div>
            {message.replyTo.type === 'image' && message.replyTo.content ? (
              <img 
                src={`data:image/jpeg;base64,${message.replyTo.content}`} 
                alt="Replied image"
                className="reply-image-preview"
              />
            ) : message.replyTo.content && (message.replyTo.content.startsWith('iVBORw0KG') || message.replyTo.content.match(/^\/9j\//)) ? (
              // Reply content is base64 image
              <img 
                src={`data:image/jpeg;base64,${message.replyTo.content}`} 
                alt="Replied image"
                className="reply-image-preview"
              />
            ) : message.replyTo.content && message.replyTo.content.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i) ? (
              // Reply content is image URL
              <img 
                src={message.replyTo.content}
                alt="Replied image"
                className="reply-image-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
            ) : (
              <div className="reply-content">{replyContent}</div>
            )}
            {message.replyTo.content && message.replyTo.content.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i) && (
              <div className="reply-content" style={{ display: 'none' }}>🖼️ Image link</div>
            )}
          </div>
          <p className="message-content">{message.content}</p>
        </div>
      );
    }

    // Check if content is a base64 image (detect by checking if it starts with image data)
    if (message.content && (message.content.startsWith('iVBORw0KG') || message.content.match(/^\/9j\//))) {
      return (
        <div className="image-message">
          <img 
            src={`data:image/jpeg;base64,${message.content}`} 
            alt="Shared image"
            className="message-image-thumbnail"
          />
          <a 
            href={`data:image/jpeg;base64,${message.content}`} 
            download={`image-${message.messageId}.jpg`}
            className="download-link"
            title="Download image"
          >
            ⬇️
          </a>
        </div>
      );
    }

    // Check if content is a URL (image link)
    if (message.content && message.content.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i)) {
      return (
        <div className="image-message">
          <img 
            src={message.content}
            alt="Shared image"
            className="message-image-thumbnail"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<p class="message-content">' + message.content + '</p>';
            }}
          />
          <a 
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
            title="Open image"
          >
            🔗
          </a>
        </div>
      );
    }

    return <p className="message-content">{message.content}</p>;
  };

  return (
    <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`} ref={messageRef}>
      <div className={`message-bubble ${isSent ? 'sent-bubble' : 'received-bubble'}`}>
        {renderContent()}

        <div className="message-footer">
          <span className="message-time">
            {formatTime(message.timestamp)}
          </span>

          {message.isEdited && <span className="edited-label">(edited)</span>}

          {renderStatusIndicators()}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className={`reactions ${isSent ? 'sent-reactions' : 'received-reactions'}`}>
            {message.reactions.map((reaction, idx) => (
              <span key={idx} className="reaction">
                {reaction.emoji} <small>{reaction.count || 1}</small>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="message-actions">
        <button
          className="reply-btn"
          onClick={handleReply}
          title="Reply to message"
        >
          ↩️
        </button>

        <button
          className="reaction-btn"
          onClick={() => setShowReactions(!showReactions)}
          title="Add reaction"
        >
          😊
        </button>

        {isSent && (
          <div className="options-menu">
            <button
              className="options-btn"
              onClick={() => setShowOptions(!showOptions)}
              title="More options"
            >
              ⋮
            </button>
            {showOptions && (
              <div className="options-dropdown">
                {isEditable && (
                  <button className="option-item" onClick={() => setIsEditing(true)}>
                    ✏️ Edit
                  </button>
                )}
                <button className="option-item" onClick={() => handleDeleteMessage(false)}>
                  🗑️ Delete for me
                </button>
                <button className="option-item delete-everyone" onClick={() => handleDeleteMessage(true)}>
                  🗑️ Delete for everyone
                </button>
              </div>
            )}
          </div>
        )}

        {showReactions && <ReactionPicker onSelectEmoji={handleAddReaction} />}
      </div>
    </div>
  );
};
