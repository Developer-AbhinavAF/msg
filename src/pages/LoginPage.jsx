import React, { useState } from 'react';
import './LoginPage.css';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

// Fixed room ID - both users chat in this room
const SHARED_ROOM_ID = 'chat_abhi_her';

export const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      login(user, SHARED_ROOM_ID);  // Always use the shared room
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Private Chat</h1>
        <p className="login-subtitle">Login to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Enter Chat'}
          </button>
        </form>

        <p className="login-footer">
          <strong>Test Credentials:</strong><br/>
          Account 1: Username <code>1111</code> / Password <code>Abhi6910</code><br/>
          Account 2: Username <code>6910</code> / Password <code>Adiuiscute</code><br/><br/>
          This is a private, secure space. Both accounts share the same chat room.
        </p>
      </div>
    </div>
  );
};
