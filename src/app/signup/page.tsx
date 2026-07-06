"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldAlert } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          department: department || undefined,
          year: year ? parseInt(year, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (data.user?.collegeStatus === "PENDING") {
        setIsPending(true);
      }
    } catch (err: any) {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-primary px-4 py-12 text-text-primary">
        <div className="w-full max-w-md text-center space-y-6 rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card backdrop-blur-xl">
          <GraduationCap className="h-16 w-16 text-accent-primary mx-auto animate-bounce" />
          <h2 className="text-3xl font-extrabold">Account Created!</h2>
          
          {isPending ? (
            <div className="rounded-xl border border-accent-warning/30 bg-semantic-kit-badge-bg p-4 text-sm text-accent-warning space-y-2">
              <ShieldAlert className="h-5 w-5 mx-auto" />
              <p className="font-semibold">Your college is being verified</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Since your email domain is new, we created a pending workspace for your college. You can sign in and browse/upload files immediately.
              </p>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">
              Your account was successfully registered and linked to your college sandbox.
            </p>
          )}

          <Link
            href="/login"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover transition-all shadow-lg"
          >
            Continue to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Join your college's walled-off exam survival toolkit
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card backdrop-blur-xl">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-text-secondary">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-text-secondary">
                College Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="jane@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
              />
              <span className="text-[10px] text-text-tertiary block">
                Must be an institutional address. Personal domains (gmail, yahoo, etc.) are blocked.
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-semibold text-text-secondary">
                  Dept (e.g. CSE)
                </label>
                <input
                  id="department"
                  type="text"
                  placeholder="Optional"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-semibold text-text-secondary">
                  Year / Semester
                </label>
                <input
                  id="year"
                  type="number"
                  placeholder="Optional"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-accent-panic/30 bg-accent-panic-glow px-4 py-3 text-sm text-accent-panic">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-full bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all shadow-lg hover:shadow-accent-primary/10 mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
