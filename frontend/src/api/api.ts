import axiosInstance from '@/api/axiosInstance';
import type { 
  User, 
  SignupInput, 
  LoginInput, 
  AuthResponse, 
  SignupResponse 
} from '@/types/auth';

// Extended login parameters to support OAuth or other authentication methods
export interface LoginCredentials extends LoginInput {
  code?: string; // Reserved for 42 OAuth and similar features
}

export const authApi = {
  /**
   * 1. User Signup (Register)
   * Corresponds to backend: POST /api/auth/register
   * Required fields: email, username, password
   */
  register: (data: SignupInput) => 
    axiosInstance.post<SignupResponse>('/auth/register', data),

  /**
   * 2. User Login
   * Corresponds to backend: POST /api/auth/login
   */
  login: (credentials: LoginCredentials) => 
    axiosInstance.post<AuthResponse>('/auth/login', credentials),

  /**
   * 3. Get current logged-in user info (Session Recovery)
   * Corresponds to backend: GET /api/users/me (note: path is /users)
   */
  getMe: () => 
    axiosInstance.get<User>('/users/me'),

  /**
   * 4. User Logout
   * Corresponds to backend: POST /api/auth/logout
   */
  logout: () => 
    axiosInstance.post('/auth/logout'),

  /**
   * 5. Avatar Upload (Optimized wrapper)
   * Corresponds to backend: POST /api/upload
   * Logic: API layer automatically builds FormData, UI only needs to pass a File object
   */
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    // 'file' must match the field name in backend upload.middleware
    formData.append('file', file); 

    const response = await axiosInstance.post('/upload', formData, {
      // Note: Axios automatically sets correct Content-Type and boundary for FormData
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};