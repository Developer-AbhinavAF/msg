import React, { useState, useRef } from 'react';
import './MessageInput.css';
import { useChat } from '../context/ChatContext';
import { emitTyping, emitAttachment, emitVoiceMessage } from '../utils/socket';

const EMOJIS = ['😊', '😂', '❤️', '👍', '🔥', '✨', '👏', '🎉'];

export const MessageInput = ({ onSendMessage, senderName = 'User' }) => {
  const { replyingTo, setReplyingTo } = useChat();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Emit typing indicator
    if (!typingTimeoutRef.current) {
      emitTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    onSendMessage({
      content: message,
      type: 'text',
      replyTo: replyingTo,
    });

    setMessage('');
    setReplyingTo(null);
    emitTyping(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          emitVoiceMessage(base64Audio, recordingTime, senderName);
          setRecordingTime(0);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Cannot access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  // File attachment
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1];
        emitAttachment(file.name, base64File, file.type, file.size, senderName);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error uploading file');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="message-input-container">
      <div className="input-wrapper">
        {replyingTo && (
          <div className="reply-preview">
            <div className="reply-info">
              <span className="reply-to">Replying to {replyingTo.senderName}</span>
              <p className="reply-text">{replyingTo.content}</p>
            </div>
            <button 
              className="reply-close"
              onClick={() => setReplyingTo(null)}
              title="Cancel reply"
            >
              ✕
            </button>
          </div>
        )}
        <div className="input-field">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="message-textarea"
            rows="3"
            disabled={isRecording}
          />

          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              <span className="recording-time">{formatRecordingTime(recordingTime)}</span>
            </div>
          )}

          <div className="input-actions">
            <button
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
              disabled={isRecording}
            >
              😊
            </button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              disabled={isRecording}
            >
              📎
            </button>

            {isRecording ? (
              <button
                onClick={stopRecording}
                className="send-btn recording"
                title="Stop recording"
              >
                ⏹️
              </button>
            ) : (
              <>
                <button
                  onClick={startRecording}
                  className="voice-btn"
                  title="Record voice message"
                  disabled={!message.trim()}
                >
                  🎤
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="send-btn"
                  title="Send message"
                >
                  ↑
                </button>
              </>
            )}
          </div>
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-option"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
