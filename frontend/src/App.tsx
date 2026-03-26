import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';

// --- Import page components ---
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import ChatPage from '@/pages/ChatPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  /**
   * App initialization phase:
   * Check if a token exists in localStorage.
   * If it exists, call GET /users/me
   * to restore authentication state.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public routes (accessible only to non-authenticated users) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- OAuth callback route (must be outside all guards) ---
            This route MUST NOT be inside PublicRoute or ProtectedRoute.
            It handles the JWT returned from 42 OAuth and redirects to home.
        */}
        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        {/* --- Protected routes (authentication required) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          
          {/* Core logic: dynamic parameter :id
             path="/profile/:id?" means :id is optional.
             - /profile      -> shows current logged-in user
             - /profile/42   -> shows user with ID 42
          */}
          <Route path="/profile/:id?" element={<ProfilePage />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={
          <div style={{ 
            textAlign: 'center', 
            marginTop: '100px', 
            fontFamily: 'JetBrains Mono, monospace',
            color: '#fff',
            background: '#050505',
            height: '100vh'
          }}>
            <h1 style={{ color: '#A2D2FF', fontSize: '3rem' }}>404</h1>
            <p style={{ opacity: 0.7 }}>[ERROR]: ROUTE_NOT_FOUND</p>
            <a 
              href="/" 
              style={{ 
                color: '#A2D2FF', 
                textDecoration: 'none', 
                border: '1px solid #A2D2FF', 
                padding: '10px 20px', 
                display: 'inline-block', 
                marginTop: '20px' 
              }}
            >
              RETURN_TO_HOME
            </a>
          </div>
        } />
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