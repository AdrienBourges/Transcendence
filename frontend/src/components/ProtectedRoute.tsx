import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

// Protect routes that require authentication
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // If user info is still loading (e.g., checking authentication), show a loading indicator
  if (isLoading) return <div>Loading...</div>;

  // If not logged in, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render child routes (Outlet)
  return <Outlet />;
};

// Protect routes that should only be accessible to unauthenticated users
// (e.g., login or register pages; hidden from logged-in users)
export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading indicator while authentication status is being determined
  if (isLoading) return <div>Loading...</div>;

  // If user is already logged in, redirect to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, render child routes (Outlet)
  return <Outlet />;
};
