// src/features/auth/api.ts
import axiosInstance from '@/api/axiosInstance';
import type { 
  LoginInput, 
  SignupInput, 
  AuthResponse, 
  User,
  SignupResponse 
} from '@/types/auth';

/**
 * Authentication API methods
 * Includes standard login/register and 42 OAuth (Step 1 & Step 2)
 */
export const authApi = {
  // 1. Standard email/password login
  login: (data: LoginInput) => 
    axiosInstance.post<AuthResponse>('/auth/login', data),

  // 2. Standard user registration
  register: (data: SignupInput) => 
    axiosInstance.post<SignupResponse>('/auth/register', data),

  /**
   * 3. 42 OAuth Step 1: Redirect to 42 Intra
   * Triggered when the user clicks the "Login with 42" button.
   * This function does not return anything; it changes the page URL.
   */
  login42: () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${apiUrl}/auth/42`;
  },

  /**
   * 4. 42 OAuth Step 2: Exchange Authorization Code for JWT
   * Triggered in LoginPage's useEffect when returning from 42.
   * Corresponds to backend: POST /auth/42/callback
   */
  callback42: (code: string) => 
    axiosInstance.post<AuthResponse>('/auth/42/callback', { code }),

  // 5. Fetch the currently authenticated user profile
  getMe: () => 
    axiosInstance.get<User>('/users/me'),

  // 6. Terminate the user session
  logout: () => 
    axiosInstance.post('/auth/logout'),
};