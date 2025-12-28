import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  logout: () =>
    api.post('/auth/logout'),
};

// Chat endpoints
export const chatAPI = {
  getMessages: (roomId, offset = 0, limit = 25) =>
    api.get(`/chat/${roomId}/messages`, { params: { offset, limit } }),
  sendMessage: (roomId, messageData) =>
    api.post(`/chat/${roomId}/messages`, messageData),
  updateMessage: (roomId, messageId, updates) =>
    api.patch(`/chat/${roomId}/messages/${messageId}`, updates),
  deleteMessage: (roomId, messageId) =>
    api.delete(`/chat/${roomId}/messages/${messageId}`),
  getRoomData: (roomId) =>
    api.get(`/chat/${roomId}`),
};

// User endpoints
export const userAPI = {
  getProfile: (userId) =>
    api.get(`/users/${userId}`),
  updateProfile: (userId, profileData) =>
    api.patch(`/users/${userId}`, profileData),
  setNickname: (userId, nickname) =>
    api.post(`/users/nickname`, { userId, nickname }),
};

// Media endpoints
export const mediaAPI = {
  uploadMedia: (roomId, formData) =>
    api.post(`/media/${roomId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
