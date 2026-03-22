// // src/App.tsx
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

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* STEP 1: Move it OUTSIDE of any Public/ProtectedRoute wrapper */}
//         {/* This ensures NO logic can redirect the user before the component mounts */}
//         <Route path="/auth-callback" element={<AuthCallbackPage />} />

//         {/* --- Public routes --- */}
//         <Route element={<PublicRoute />}>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//         </Route>

//         {/* --- Protected routes --- */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/chat" element={<ChatPage />} />
//         </Route>

//         <Route path="*" element={
//           <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
//             <h1>404</h1>
//             <p>Oops! Page not found.</p>
//           </div>
//         } />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;



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
   * Check if a token exists in localStorage. If so, call GET /users/me
   * to restore the authentication state.
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
          <Route path="/register" element={<RegisterPage />} />
        </Route>
 
        {/* --- OAuth Callback route (outside all guards) ---
            Must NOT be inside PublicRoute or ProtectedRoute.
            This page handles the JWT from 42 OAuth and redirects to home.
        */}
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
 
        {/* --- Protected routes (require authentication) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
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