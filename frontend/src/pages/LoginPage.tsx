import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/store/useAuthStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoginFormValues {
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  // -------------------------------------------------------------------------
  // 42 OAuth callback handler
  // When the user returns from 42's authorization page the URL contains
  // ?code=<authorization_code>.  We exchange that code for a token via the
  // backend and then log the user in, exactly like the email/password flow.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    // Remove the code from the URL immediately so a page refresh doesn't
    // trigger a second exchange attempt (codes are single-use).
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchange42Code = async () => {
      setOauthLoading(true);
      setServerError(null);
      try {
        // ✅ 1. Change to callback42
        // ✅ 2. Use destructuring to get { data } from Axios response
        const { data } = await authApi.callback42(code);
        
        // ✅ 3. Access token and user from data
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        
        navigate("/", { replace: true });
      } catch (err: any) {
        const message = err.response?.data?.error || "42 authentication failed.";
        setServerError(message);
      } finally {
        setOauthLoading(false);
      }
    };
    exchange42Code();
  }, [searchParams, navigate, setUser]);

  // -------------------------------------------------------------------------
  // Traditional email / password form
  // -------------------------------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onBlur" });

const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      /**
       * Axios returns the server response body inside the 'data' property.
       * We destructure 'data' first, which contains { token, user }.
       */
      const { data } = await authApi.login(values);
      
      // Now you can access token and user from data
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      
      navigate("/", { replace: true });
    } catch (err: unknown) {
      // Improved error handling to catch backend-specific error messages
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setServerError(message);
    }
  };

  // -------------------------------------------------------------------------
  // 42 OAuth redirect — just send the browser to the backend's OAuth entry
  // point; the backend will redirect to 42's authorization server.
  // -------------------------------------------------------------------------
  const handle42Login = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/42`;
  };

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const isLoading = isSubmitting || oauthLoading;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div style={styles.root}>
      {/* ── Background decorative blobs ── */}
      <div style={{ ...styles.blob, ...styles.blobTop }} />
      <div style={{ ...styles.blob, ...styles.blobBottom }} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>ft_</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* ── 42 OAuth section ── */}
        <button
          type="button"
          onClick={handle42Login}
          disabled={isLoading}
          style={{
            ...styles.btn42,
            ...(isLoading ? styles.btnDisabled : {}),
          }}
        >
          {oauthLoading ? (
            <span style={styles.spinner} />
          ) : (
            <FortyTwoIcon />
          )}
          {oauthLoading ? "Authenticating with 42…" : "Continue with 42"}
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or sign in with email</span>
          <span style={styles.dividerLine} />
        </div>

        {/* ── Traditional login form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
          {/* Email */}
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <p style={styles.fieldError}>{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
                },
              })}
            />
            {errors.password && (
              <p style={styles.fieldError}>{errors.password.message}</p>
            )}
          </div>

          {/* Server-level error (wrong credentials, network, etc.) */}
          {serverError && <p style={styles.serverError}>{serverError}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.btnSubmit,
              ...(isLoading ? styles.btnDisabled : {}),
            }}
          >
            {isSubmitting ? <span style={styles.spinner} /> : null}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline 42 logo SVG (avoids external asset dependency)
// ---------------------------------------------------------------------------

function FortyTwoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <text x="5" y="78" fontSize="80" fontWeight="900" fontFamily="monospace">
        42
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Styles (inline — no Tailwind / CSS module dependency)
// Swap these out for your design system as needed.
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f13",
    fontFamily: "'Geist', 'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "1rem",
  },

  // Decorative background blobs
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.25,
    pointerEvents: "none",
  },
  blobTop: {
    width: 400,
    height: 400,
    background: "#5b6fff",
    top: -100,
    right: -80,
  },
  blobBottom: {
    width: 350,
    height: 350,
    background: "#00c6a2",
    bottom: -80,
    left: -60,
  },

  // Card
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20,
    padding: "2.5rem 2rem",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },

  // Header
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: {
    display: "inline-block",
    fontSize: 32,
    fontWeight: 900,
    color: "#5b6fff",
    letterSpacing: -2,
    marginBottom: "0.75rem",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#f0f0f5",
    letterSpacing: -0.5,
  },
  subtitle: { margin: "0.35rem 0 0", fontSize: 14, color: "#8888aa" },

  // 42 button
  btn42: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "0.75rem 1rem",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e0e0f0",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
  },

  // Divider
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "1.5rem 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: { fontSize: 12, color: "#666688", whiteSpace: "nowrap" },

  // Form
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#aaaac8" },
  input: {
    padding: "0.7rem 0.9rem",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#f0f0f5",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputError: {
    borderColor: "#ff5b5b",
    boxShadow: "0 0 0 3px rgba(255,91,91,0.15)",
  },
  fieldError: { margin: 0, fontSize: 12, color: "#ff7070" },
  serverError: {
    margin: 0,
    padding: "0.65rem 0.9rem",
    borderRadius: 8,
    background: "rgba(255,80,80,0.12)",
    border: "1px solid rgba(255,80,80,0.25)",
    color: "#ff8080",
    fontSize: 13,
  },

  // Submit button
  btnSubmit: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "0.5rem",
    padding: "0.8rem",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #5b6fff 0%, #3b4fdf 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(91,111,255,0.35)",
    transition: "opacity 0.2s, transform 0.1s",
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed", transform: "none" },

  // Spinner
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  // Footer
  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: 13,
    color: "#666688",
  },
  link: { color: "#5b6fff", textDecoration: "none", fontWeight: 600 },
};
