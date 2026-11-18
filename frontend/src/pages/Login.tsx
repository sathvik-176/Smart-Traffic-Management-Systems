import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// @ts-expect-error - Existing Supabase client is JavaScript
import { supabase } from "../supabaseClient";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      setError(error?.message || "Login failed.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    setLoading(false);

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError("Unable to load user permissions.");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-brand">
          <div className="login-logo">🚦</div>
          <h1>
            Traffic<span className="brand-x">X</span>
          </h1>
          <p className="login-tagline">Smart Traffic Management System</p>
        </div>

        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <label className="login-field">
          <span className="login-field-icon">✉️</span>
          <input
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="login-field">
          <span className="login-field-icon">🔒</span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="login-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </label>

        {error && (
          <div className="login-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="login-spinner" /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>

        <p className="login-footer">
          Vehicle detection · Congestion analysis · Adaptive signal timing
        </p>
      </form>
    </div>
  );
}

export default Login;
