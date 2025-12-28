import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const roomId = localStorage.getItem('roomId');
    if (storedUser && roomId) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setError('Failed to load user data');
      }
    }
    setLoading(false);

    // Disable browser back/forward navigation to prevent history
    window.history.pushState(null, null, window.location.href);
    const handlePopState = (e) => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const login = (userData, roomId) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roomId', roomId);
    setUser(userData);
    // Clear history on login
    if (window.history.length > 1) {
      window.history.go(-window.history.length + 1);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('roomId');
    setUser(null);
    
    // Clear browser history and session storage on logout
    window.sessionStorage.clear();
    localStorage.clear();
    
    // Clear the entire history
    if (typeof window !== 'undefined') {
      const newWindow = window.open('about:blank', '_self');
      newWindow?.close();
      
      // Replace history to prevent back navigation
      window.history.replaceState({}, document.title, window.location.href);
      window.history.pushState(null, null, window.location.href);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
