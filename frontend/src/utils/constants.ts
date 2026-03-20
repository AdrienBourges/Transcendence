// 1. Unified variable name for storing the token to prevent typos
export const AUTH_TOKEN_KEY = 'auth_token';

// 2. Route path constants (for easier centralized updates in the future)
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  PROFILE: '/profile',
};

// 3. API response status codes (optional, improves code readability)
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}