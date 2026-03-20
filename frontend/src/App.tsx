import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';

// --- Import page components ---
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage'; // Import the register page we just created
import ProfilePage from '@/pages/ProfilePage';
import ChatPage from '@/pages/ChatPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  /**
   * App initialization phase:
   * Check if a token exists in localStorage. If so, call GET /users/me
   * to restore the authentication state.
   * This is where the axiosInstance interceptor you implemented comes into play.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public routes (accessible only to unauthenticated users) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* Replaces the previous placeholder */}
        </Route>

        {/* --- Protected routes (require authentication) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          {/* Additional authenticated routes can be added here, e.g. /groups */}
        </Route>

        {/* 404 page */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404</h1>
            <p>Oops! Page not found.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
