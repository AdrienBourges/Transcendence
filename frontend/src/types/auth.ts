/**
 * 1. Base user model (User Model)
 * Corresponds to backend: prisma/schema.prisma
 * Note: includes the username field added in the 20260319 migration
 */
export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string; // Reserved for backend upload feature
  createdAt?: string;
  updatedAt?: string;
  authProvider?: string;
  profile?: {
    avatarUrl: string | null;
  }
}

/**
 * 2. Signup request data (Signup Request Payload)
 * Corresponds to backend: src/schemas/auth.schema.ts (SignupSchema)
 */
export interface SignupInput {
  email: string;
  username: string; // Must be included, otherwise backend Zod will throw an error
  password: string;
}

/**
 * 3. Login request data (Login Request Payload)
 * Corresponds to backend: src/schemas/auth.schema.ts (LoginSchema)
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * 4. API response structures (API Response Shapes)
 */

// Response format for successful signup
export interface SignupResponse {
  user: User;
}

// Response format for successful login (includes token)
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * 5. Error response structure (Error Response)
 * Corresponds to backend: src/utils/ApiError.ts
 */
export interface ApiErrorResponse {
  error?: string;   // Matches the { "error": "..." } format you mentioned
  message?: string; // Compatible with common backend error fields
  errors?: Array<{  // Detailed errors for Zod validation failures
    path: string[];
    message: string;
  }>;
}