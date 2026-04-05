// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * PROTECTED ROUTE
 * Only allows authenticated users. 
 * Prevents "Empty Shell" bug by checking isLoading.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  //console.log('ProtectedRoute:', { isAuthenticated, isLoading });
  // 1. While checkAuth is running, show a clean loading screen
  // This prevents the "Flash of Unstyled/Empty Content"
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        background: '#050505', 
        color: '#A2D2FF', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace' 
      }}>
        <div style={{ marginBottom: '10px' }}>[RE-ESTABLISHING_SECURE_LINK...]</div>
        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>AUTHENTICATING_NODE_CREDENTIALS</div>
      </div>
    );
  }

  // 2. If finished loading and not logged in, kick to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in, render the child route (HomePage, Profile, etc.)
  return <Outlet />;
};

/**
 * PUBLIC ROUTE
 * Only allows GUESTS. 
 * If a logged-in user tries to go to /login, they are sent back to / (Home).
 */
export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null; // Or a smaller spinner

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
