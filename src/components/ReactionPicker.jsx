import React from 'react';
import './ReactionPicker.css';

const EMOJI_LIST = [
  '😊', '😂', '❤️', '😢', '😡', '🤔', '👍', '👎',
  '🔥', '✨', '🎉', '🎈', '🎁', '👏', '🙌', '💪',
  '🚀', '⭐', '💯', '🙏', '💖', '😍', '😘', '🤗',
];

export const ReactionPicker = ({ onSelectEmoji }) => {
  return (
    <div className="reaction-picker-container">
      <div className="emoji-grid">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            className="emoji-item"
            onClick={() => onSelectEmoji(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
