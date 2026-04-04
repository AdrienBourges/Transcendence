import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore'; // Ensure the path is correct
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';

// --- Pages ---
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import ChatPage from '@/pages/ChatPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  // Update 1: Use the latest disconnectAll method
  const disconnectAll = useChatStore((state) => state.disconnectAll);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Session Management:
   * Destroy all active Socket instances when the user logs out or the app unmounts.
   */
  useEffect(() => {
    if (!user) {
      // Update 2: Call the thorough cleanup method
      disconnectAll();
    }
    
    return () => {
      // Cleanup on unmount to prevent duplicate connections during hot updates in development
      disconnectAll();
    };
  }, [user, disconnectAll]);

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#050505',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#A2D2FF'
      }}>
        <div style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>[INITIALIZING_SECURE_LINK...]</div>
        <div style={{ marginTop: '10px', opacity: 0.5, fontSize: '0.8rem' }}>VERIFYING_CREDENTIALS_AT_NODE_42</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile/:id?" element={<ProfilePage />} />
        </Route>

        <Route
          path="*"
          element={
            <div
              style={{
                textAlign: 'center',
                paddingTop: '100px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#fff',
                background: '#050505',
                height: '100vh',
                boxSizing: 'border-box'
              }}
            >
              <h1 style={{ color: '#A2D2FF', fontSize: '3.5rem', marginBottom: '10px' }}>42</h1>
              <p style={{ opacity: 0.7, marginBottom: '30px' }}>[ERROR]: ROUTE_NOT_FOUND_IN_DATABASE</p>
              <a
                href="/"
                style={{
                  color: '#A2D2FF',
                  textDecoration: 'none',
                  border: '1px solid #A2D2FF',
                  padding: '10px 24px',
                  display: 'inline-block',
                  fontSize: '0.9rem',
                  transition: '0.2s'
                }}
              >
                RETURN_TO_HOME
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
