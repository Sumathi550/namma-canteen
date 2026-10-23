import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Utensils, Mail, Lock, ArrowRight, LoaderCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-brand">
        <span className="auth-logo">
          <Utensils size={24} />
        </span>
        <span>
          Namma<span>Canteen</span>
        </span>
      </Link>

      <section className="auth-card">
        <div className="auth-emoji">🍛</div>

        <p className="auth-eyebrow">VANAKKAM • WELCOME BACK</p>
        <h1>Authentic Food Awaits!</h1>
        <p className="auth-description">
          Sign in to pre-order hot Tamil Nadu canteen specials with zero waiting.
        </p>

        {error && (
          <div className="auth-error-banner" style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="login-email"
              type="email"
              placeholder="you@college.edu or gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="login-password">Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <LoaderCircle size={18} className="spin" />
                Signing in...
              </span>
            ) : (
              <span>Sign in</span>
            )}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </section>
    </main>
  );
}
