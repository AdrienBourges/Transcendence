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
   * 2. Error state
   */
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle input field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.register(formData);
      console.log("Registration successful!");
      navigate('/login');
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-container"
      style={{
        color: "#e6f0ff",
        backgroundColor: "#121212",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <h2 style={{ color: "#ffffff", marginBottom: "20px" }}>
        Create an Account
      </h2>

      {error && (
        <div
          style={{
            color: "#ff6b6b",
            marginBottom: "1rem",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "400px" }}
      >
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label style={{ color: "#cce0ff" }}>Username</label>
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              border: "1px solid #555",
              borderRadius: "5px",
            }}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label style={{ color: "#cce0ff" }}>Email</label>
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              border: "1px solid #555",
              borderRadius: "5px",
            }}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="test@test.com"
          />
        </div>

        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label style={{ color: "#cce0ff" }}>Password</label>
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              border: "1px solid #555",
              borderRadius: "5px",
            }}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#4da6ff",
            color: "#fff",
            border: "none",
            padding: "12px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: "20px", color: "#cce0ff" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#66b3ff" }}>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;