import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore'; 
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';

// --- Pages ---
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import ChatPage from '@/pages/ChatPage';
import GroupsPage from '@/pages/GroupsPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import GroupDetailPage from './pages/GroupDetailPage';
import TeammateFinderPage from './pages/TeammateFinderPage';
import SearchPage from '@/pages/SearchPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  
  /**
   * Session Management:
   * Destroy all active Socket instances when the user logs out or the app unmounts.
   * This uses the latest disconnectAll method from useChatStore.
   */
  const disconnectAll = useChatStore((state) => state.disconnectAll);

  // Initialize Authentication on App start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Global Socket Cleanup:
   * 1. If user becomes null (Logout), clear all socket links.
   * 2. When App component unmounts, perform a thorough cleanup to prevent 
   * duplicate connections during hot updates in development.
   */
  useEffect(() => {
    if (!user) {
      disconnectAll();
    }
    
    return () => {
      disconnectAll();
    };
  }, [user, disconnectAll]);

  /**
   * NOTE ON LOADING STATE:
   * We no longer return the full-screen loader here at the top level.
   * By wrapping everything in BrowserRouter immediately, we allow 
   * ProtectedRoute to handle the 'isLoading' state internally.
   * This prevents "ghost" renders where HomePage might try to load 
   * with empty user data (showing ID: 0) before checkAuth finishes.
   */

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes (Only accessible when NOT logged in) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- Auth Callback (Handles OAuth redirects) --- */}
        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        {/* --- Protected Routes (Require valid Token/User) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile/:id?" element={<ProfilePage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/teammate-finder" element={<TeammateFinderPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* --- 404 Route (Styled for the 42 Transcendence theme) --- */}
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
