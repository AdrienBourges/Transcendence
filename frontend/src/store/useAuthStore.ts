import { create } from 'zustand';
import type { User, LoginInput } from '@/types/auth'; 
import { authApi } from '@/features/auth/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // This is the key to preventing the "flicker"

  setUser: (user: User | null) => void;
  login: (credentials: LoginInput) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially true while we check for existing tokens

  /**
   * Manually update user state
   */
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isLoading: false 
  }),

  /**
   * Login logic: Calls API, stores token, and updates global state
   */
  login: async (credentials: LoginInput) => {
    try {
      set({ isLoading: true });
      const { data } = await authApi.login(credentials);
      
      localStorage.setItem('auth_token', data.token);
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error; 
    }
  },

  /**
   * App Startup Check: Validates the token and retrieves user data
   */
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // No token found, finish loading and stay unauthenticated
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      // Validate token by fetching current user profile
      const { data } = await authApi.getMe();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Token invalid or expired, clear storage and state
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Logout: Clears session and local storage
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));