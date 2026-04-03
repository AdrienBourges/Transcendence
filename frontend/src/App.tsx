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
import AuthCallbackPage from '@/pages/AuthCallbackPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  
  // Only use disconnect here for cleanup purposes
  const disconnect = useChatStore((state) => state.disconnect);

  /**
   * App initialization:
   * Restore auth state from token (if exists)
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Socket lifecycle management:
   * We do NOT call connect() here because it requires a conversationId.
   * Connection is handled locally by pages (e.g., ProfilePage) after 
   * retrieving a valid conversation ID from the backend.
   */
  useEffect(() => {
    // If user logs out, ensure any active socket is terminated
    if (!user) {
      disconnect();
    }

    // Global cleanup on app unmount
    return () => {
      disconnect();
    };
  }, [user, disconnect]);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public routes (only for unauthenticated users) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- OAuth callback (must stay outside guards) --- */}
        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        {/* --- Protected routes (require authentication) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />

          {/* Profile routing:
              /profile      -> current user's profile
              /profile/:id  -> specific user's profile
          */}
          <Route path="/profile/:id?" element={<ProfilePage />} />
        </Route>

        {/* --- 404 - Terminal Style --- */}
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
              <h1 style={{ color: '#A2D2FF', fontSize: '3.5rem', marginBottom: '10px' }}>404</h1>
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
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(162, 210, 255, 0.1)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
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


// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { useEffect } from 'react';
// import { useAuthStore } from '@/store/useAuthStore';
// import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';
// // --- Import page components ---
// import HomePage from '@/pages/HomePage';
// import LoginPage from '@/pages/LoginPage';
// import RegisterPage from '@/pages/RegisterPage';
// import ProfilePage from '@/pages/ProfilePage';
// import ChatPage from '@/pages/ChatPage';
// import AuthCallbackPage from '@/pages/AuthCallbackPage';
 
// function App() {
//   const checkAuth = useAuthStore((state) => state.checkAuth);
 
//   /**
//    * App initialization phase:
//    * Check if a token exists in localStorage. If so, call GET /users/me
//    * to restore the authentication state.
//    */
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);
 
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* --- Public routes (accessible only to unauthenticated users) --- */}
//         <Route element={<PublicRoute />}>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//         </Route>
 
//         {/* --- OAuth Callback route (outside all guards) ---
//             Must NOT be inside PublicRoute or ProtectedRoute.
//             This page handles the JWT from 42 OAuth and redirects to home.
//         */}
//         <Route path="/auth-callback" element={<AuthCallbackPage />} />
 
//         {/* --- Protected routes (require authentication) --- */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/chat" element={<ChatPage />} />
//         </Route>
 
//         {/* 404 page */}
//         <Route path="*" element={
//           <div style={{ textAlign: 'center', marginTop: '50px' }}>
//             <h1>404</h1>
//             <p>Oops! Page not found.</p>
//           </div>
//         } />
//       </Routes>
//     </BrowserRouter>
//   );
// }
 
// export default App;