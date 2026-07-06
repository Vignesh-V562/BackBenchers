"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Invalid credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary px-4 py-12 text-text-primary">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-accent-primary" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-text-primary via-accent-primary to-accent-primary-hover bg-clip-text text-transparent">
              Backbenchers
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to continue to your college sandbox
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-text-secondary">
                College Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-accent-panic/30 bg-accent-panic-glow px-4 py-3 text-sm text-accent-panic">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-full bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all shadow-lg hover:shadow-accent-primary/10"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
