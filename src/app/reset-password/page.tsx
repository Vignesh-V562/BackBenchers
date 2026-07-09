"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, AlertCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing in the URL.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md glass-card p-8 space-y-4 text-center">
        <AlertCircle className="h-16 w-16 text-accent-panic mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-white">Invalid Reset Link</h2>
        <p className="text-sm text-text-secondary">
          The password reset token is missing. Please request a new link.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-sm font-bold text-text-primary transition-all mt-2"
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md glass-card p-8 space-y-6 text-center animate-fade-in-up">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-accent-success/20 blur-md animate-ping" />
          <CheckCircle className="h-16 w-16 text-accent-success relative z-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-white">Password Updated!</h2>
        <p className="text-sm text-text-secondary">
          Your password has been successfully reset. You can now sign in with your new credentials.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover transition-all flex items-center justify-center gap-2 mt-2 font-semibold"
        >
          Go to Sign In
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md glass-card p-8 space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-text-secondary mt-1.5">
          Choose a secure new password for your account
        </p>
      </div>

      {error && (
        <div className="auth-error flex items-center gap-2 p-3 bg-accent-panic/10 border border-accent-panic/20 text-accent-panic rounded-lg text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="auth-input-wrap relative">
          <Lock className="auth-input-icon text-text-tertiary" />
          <input
            type="password"
            placeholder="New Password (Min. 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input w-full h-10 px-10 rounded-lg glass-form-control text-sm text-white"
            minLength={6}
          />
        </div>

        {/* Confirm Password */}
        <div className="auth-input-wrap relative">
          <Lock className="auth-input-icon text-text-tertiary" />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input w-full h-10 px-10 rounded-lg glass-form-control text-sm text-white"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              Update Password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Full-bleed background image with dark overlay */}
      <div className="auth-bg" />

      {/* Floating ambient particles */}
      <div className="auth-particle absolute top-[15%] left-[8%] w-2 h-2 bg-accent-primary/60 blur-[2px] animate-float-slow" />
      <div className="auth-particle absolute top-[25%] right-[12%] w-1.5 h-1.5 bg-accent-panic/50 blur-[1px] animate-float-medium" />
      <div className="auth-particle absolute bottom-[20%] left-[15%] w-1 h-1 bg-white/40 blur-[1px] animate-pulse-slow" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-card p-8 space-y-6 text-center">
          <Loader2 className="h-16 w-16 text-accent-primary animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-white">Loading...</h2>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>

      {/* Bottom branding */}
      <div className="absolute bottom-4 z-10 text-center">
        <p className="text-[10px] text-white/30 tracking-wider uppercase">
          © 2026 Backbenchers · Peer-to-Peer Academic Platform
        </p>
      </div>
    </div>
  );
}
