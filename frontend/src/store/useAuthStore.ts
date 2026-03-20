// src/store/useAuthStore.ts
import { create } from 'zustand';
// Note: If you don't need persistence to LocalStorage (except for the Token), you can avoid using persist
// Here we keep manual token management logic, which makes it clearer
import type { User, LoginInput } from '@/types/auth'; 
import { authApi } from '@/features/auth/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /**
   * Method definitions
   */
  setUser: (user: User | null) => void;
  login: (credentials: LoginInput) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /**
   * Update user information
   */
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isLoading: false 
  }),

  /**
   * 1. Login logic
   * Call API -> get data from response.data -> store token -> update state
   */
  login: async (credentials: LoginInput) => {
    try {
      set({ isLoading: true });
      // ✅ Fix: Axios data is in .data
      const { data } = await authApi.login(credentials);
      
      localStorage.setItem('auth_token', data.token);
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error; // Re-throw error so LoginPage try-catch can handle and display it to the user
    }
  },

  /**
   * 2. Initialization check: validate whether the token is valid on app startup
   */
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      // ✅ Fix: extract .data (User object) from authApi.getMe() Axios response
      const { data } = await authApi.getMe();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // If token is expired or invalid, clear local storage
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * 3. Logout logic
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  },
}));