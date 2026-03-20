import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/features/auth/api';
import type { SignupInput } from '@/types/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  /**
   * 1. Form state management
   */
  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    username: '',
    password: '',
  });

  /**
   * 2. Error state (corresponds to backend ApiErrorResponse)
   */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle input field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Clear error message while typing
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the register method from api.ts
      await authApi.register(formData);
      
      // Success: redirect to login page after successful registration
      console.log("Registration successful!");
      navigate('/login');
    } catch (err: any) {
      // Error: handle backend response errors (e.g. 400 or 409)
      // Expected format: { "error": "Email already in use" }
      const serverMessage = err.response?.data?.error || "Registration failed. Please try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>
      
      {/* Error display area */}
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="test@test.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;