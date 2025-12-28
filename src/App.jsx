import { useState, useEffect } from 'react';
import './theme.css';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return isLoggedIn ? (
    <ChatProvider>
      <ChatPage
        onLogout={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('roomId');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }}
      />
    </ChatProvider>
  ) : (
    <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
