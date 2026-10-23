import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Utensils, User, Mail, Lock, ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
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
        <div className="auth-emoji">🌾</div>

        <p className="auth-eyebrow">CREATE STUDENT ACCOUNT</p>
        <h1>Join Namma Canteen!</h1>
        <p className="auth-description">
          Sign up to pre-order fresh Tamil Nadu canteen meals and collect hot with live digital tokens.
        </p>

        {error && (
          <div className="auth-error-banner" style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="reg-name">Full Name</label>
          <div className="auth-input">
            <User size={18} />
            <input
              id="reg-name"
              type="text"
              name="name"
              placeholder="e.g. Priya Sundar"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="reg-email">College Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@college.edu or gmail"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="reg-password">Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              id="reg-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <label htmlFor="reg-confirm">Confirm Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <LoaderCircle size={18} className="spin" />
                Creating account...
              </span>
            ) : (
              <span>Create Account</span>
            )}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </section>
    </main>
  );
}
