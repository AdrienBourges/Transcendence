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
// Component: LoginPage
// Handles both traditional Email/Password login and 42 OAuth2 flow.
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Zustand store actions
  const setUser = useAuthStore((s) => s.setUser);

  // Local UI state
  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  // -------------------------------------------------------------------------
  // 42 OAuth Callback Logic
  // 1. User is redirected back from 42 Intra with ?code=xxx
  // 2. We catch that code and send it to our backend /api/auth/callback
  // 3. Backend exchanges code for token and returns User + JWT
  // -------------------------------------------------------------------------
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    /**
     * Security Best Practice: 
     * Remove the 'code' from the URL immediately after reading it.
     * This prevents re-sending the same code on page refresh (codes are one-time use).
     */
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchange42Code = async () => {
      setOauthLoading(true);
      setServerError(null);
      try {
        // Step 1: Send authorization code to your backend
        const { data } = await authApi.callback42(code);
        
        // Step 2: Persist JWT and update global state
        // Note: Using "auth_token" to match your App.tsx checkAuth logic
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        
        // Step 3: Redirect to home/dashboard
        navigate("/", { replace: true });
      } catch (err: any) {
        // Handle backend errors (e.g., code expired, 42 API down)
        const message = err.response?.data?.error || "42 authentication failed.";
        setServerError(message);
      } finally {
        setOauthLoading(false);
      }
    };

    exchange42Code();
  }, [searchParams, navigate, setUser]);

  // -------------------------------------------------------------------------
  // Traditional Email/Password Form Logic
  // -------------------------------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onBlur" });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      // Direct call to your backend login endpoint
      const { data } = await authApi.login(values);
      
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      
      navigate("/", { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.error || "Login failed. Please check your credentials.";
      setServerError(message);
    }
  };

// -------------------------------------------------------------------------
  // 42 OAuth redirect
  // We use the exact Client ID and Redirect URI provided by the teammate.
  // -------------------------------------------------------------------------
  const handle42Login = () => {
    const rootUrl = "https://api.intra.42.fr/oauth/authorize";
    
    // Using URLSearchParams to ensure the URL is encoded correctly
    const params = new URLSearchParams({
      client_id: "u-s4t2ud-9ac612b679f1a8dccfab14517f2f446d97dd25e3b80380cb97ddbbe64b321423",
      redirect_uri: "http://localhost:3000/api/auth/callback",
      response_type: "code",
    });

    // Final result: https://api.intra.42.fr/oauth/authorize?client_id=...&redirect_uri=...&response_type=code
    window.location.href = `${rootUrl}?${params.toString()}`;
  };

  const isLoading = isSubmitting || oauthLoading;

  return (
    <div style={styles.root}>
      {/* Background visual effects */}
      <div style={{ ...styles.blob, ...styles.blobTop }} />
      <div style={{ ...styles.blob, ...styles.blobBottom }} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>ft_transcendence</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to start playing</p>
        </div>

        {/* --- 42 OAuth Button --- */}
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
          {/* Changed text to clarify the action */}
          {oauthLoading ? "Connecting to Intra..." : "Sign in with 42 School"}
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        {/* --- Standard Login Form (unchanged) --- */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="cadet@42.fr"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.email && <p style={styles.fieldError}>{errors.email.message}</p>}
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
            />
            {errors.password && <p style={styles.fieldError}>{errors.password.message}</p>}
          </div>

          {serverError && <p style={styles.serverError}>{serverError}</p>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.btnSubmit,
              ...(isLoading ? styles.btnDisabled : {}),
            }}
          >
            {isSubmitting ? <span style={styles.spinner} /> : null}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.footer}>
          New here? <a href="/register" style={styles.link}>Create Account</a>
        </p>
      </div>
    </div>
  );
}

// --- Inline Assets & Styles ---

function FortyTwoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
       <path d="M0 20h20v20H0V20zM20 40h20v20H20V40zM40 60h20v20H40V60zM60 40h20v20H60V40zM80 20h20v20H80V20zM80 60h20v20H80V60z" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0a0a0c", position: "relative", overflow: "hidden", padding: "1rem", color: "#fff"
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(80px)", opacity: 0.15, pointerEvents: "none" },
  blobTop: { width: 400, height: 400, background: "#5b6fff", top: -100, right: -80 },
  blobBottom: { width: 350, height: 350, background: "#00c6a2", bottom: -80, left: -60 },
  card: {
    position: "relative", zIndex: 1, width: "100%", maxWidth: 400,
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24, padding: "2.5rem", backdropFilter: "blur(10px)"
  },
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: { fontSize: 24, fontWeight: 900, color: "#5b6fff", marginBottom: "0.5rem" },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 14, color: "#666" },
  btn42: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    padding: "0.8rem", borderRadius: 12, border: "1px solid #333", background: "#1a1a1c",
    color: "#fff", fontWeight: 600, cursor: "pointer"
  },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "1.5rem 0" },
  dividerLine: { flex: 1, height: 1, background: "#222" },
  dividerText: { fontSize: 11, color: "#444" },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#888" },
  input: {
    padding: "0.8rem", borderRadius: 10, border: "1px solid #222", background: "#050505",
    color: "#fff", outline: "none"
  },
  inputError: { borderColor: "#ff5b5b" },
  fieldError: { fontSize: 11, color: "#ff5b5b", margin: 0 },
  serverError: { padding: "0.8rem", background: "rgba(255,0,0,0.1)", color: "#ff5b5b", borderRadius: 8, fontSize: 13 },
  btnSubmit: {
    padding: "0.8rem", borderRadius: 12, border: "none", background: "#5b6fff",
    color: "#fff", fontWeight: 700, cursor: "pointer"
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  footer: { marginTop: "1.5rem", textAlign: "center", fontSize: 13, color: "#444" },
  link: { color: "#5b6fff", textDecoration: "none" },
  spinner: { width: 14, height: 14, border: "2px solid #555", borderTopColor: "#fff", borderRadius: "50%" }
};