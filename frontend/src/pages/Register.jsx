import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await register(form.username, form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-[var(--cx-text-muted)]">
            Start tracking with CaloriX today
          </p>
        </div>

        {/* ── Card ───────────────────────────────────────────────── */}
        <div className="cx-card">
          {error && (
            <div
              id="register-error"
              className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="register-username"
                className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]"
              >
                Username
              </label>
              <input
                id="register-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                className="cx-input"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]"
              >
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="cx-input"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]"
              >
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                className="cx-input"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="register-confirm"
                className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]"
              >
                Confirm password
              </label>
              <input
                id="register-confirm"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="cx-input"
              />
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={submitting}
              className="cx-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* ── Footer link ──────────────────────────────────────── */}
          <p className="mt-6 text-center text-sm text-[var(--cx-text-muted)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-400 transition-colors hover:text-primary-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
