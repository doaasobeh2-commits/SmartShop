import type { FormEvent } from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/overview" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate("/overview", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError("Invalid admin credentials.");
        else if (err.status === 403) setError("Forbidden.");
        else if (err.status >= 500) setError("Server error. Try again.");
        else setError(err.message);
      } else {
        setError("Unable to reach Fadi Core API. Check VITE_FADI_CORE_API_URL.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-canvas px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-line bg-white p-6 shadow-card"
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-label">
          Fadi Core Admin
        </div>
        <h1 className="mt-2 text-[24px] font-semibold text-navy-ink">Sign in</h1>
        <p className="mt-2 text-[13px] text-slate-label">
          Owner admin session for live Neon household data. Separate from end-user
          auth.
        </p>

        <label className="mt-6 block text-[12px] font-medium text-navy">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-line px-3 py-2 text-[14px]"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mt-4 block text-[12px] font-medium text-navy">
          Password
          <input
            className="mt-1 w-full rounded-lg border border-slate-line px-3 py-2 text-[14px]"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? (
          <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-800">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-navy px-3 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
