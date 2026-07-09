"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import {
  ArrowRight,
  ShieldAlert,
  Mail,
  Lock,
  User,
  Building,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface AuthCardProps {
  initialMode: "signin" | "signup";
}

export default function AuthCard({ initialMode }: AuthCardProps) {
  const router = useRouter();

  // Slide state toggling
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");

  // Sign In states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up states
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpDept, setSignUpDept] = useState("");
  const [signUpYear, setSignUpYear] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [signUpIsPending, setSignUpIsPending] = useState(false);

  // Forgot Password states
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message || "Reset link sent!");
        setForgotEmail("");
      } else {
        setForgotError(data.error || "Failed to process reset request.");
      }
    } catch {
      setForgotError("A network error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle slide animations and push history states
  const toggleMode = (signUpActive: boolean) => {
    setIsSignUp(signUpActive);
    if (signUpActive) {
      window.history.pushState(null, "", "/signup");
    } else {
      window.history.pushState(null, "", "/login");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: signInEmail,
        password: signInPassword,
      });

      if (res?.error) {
        setSignInError(res.error || "Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setSignInError("An unexpected error occurred.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    setSignUpLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
          department: signUpDept || undefined,
          year: signUpYear ? parseInt(signUpYear, 10) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignUpError(data.error || "Signup failed.");
        setSignUpLoading(false);
        return;
      }

      setSignUpSuccess(true);
      if (data.user?.collegeStatus === "PENDING") {
        setSignUpIsPending(true);
      }
    } catch {
      setSignUpError("An unexpected network error occurred.");
      setSignUpLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Full-bleed background image with dark overlay */}
      <div className="auth-bg" />

      {/* Floating ambient particles */}
      <div className="auth-particle absolute top-[15%] left-[8%] w-2 h-2 bg-accent-primary/60 blur-[2px] animate-float-slow" />
      <div className="auth-particle absolute top-[25%] right-[12%] w-1.5 h-1.5 bg-accent-panic/50 blur-[1px] animate-float-medium" />
      <div className="auth-particle absolute bottom-[20%] left-[15%] w-1 h-1 bg-white/40 blur-[1px] animate-pulse-slow" />
      <div className="auth-particle absolute bottom-[30%] right-[20%] w-2.5 h-2.5 bg-accent-primary/30 blur-[3px] animate-float-slow" />
      <div className="auth-particle absolute top-[60%] left-[5%] w-1.5 h-1.5 bg-accent-warning/30 blur-[2px] animate-float-medium" />

      {/* ======================================================= */}
      {/* MAIN GLASS CONTAINER (Double Slider)                    */}
      {/* ======================================================= */}
      <div
        id="auth-container"
        className={`auth-container relative z-10 ${
          isSignUp ? "right-panel-active" : ""
        }`}
      >
        {/* ===================================================== */}
        {/* SIGN UP FORM PANEL                                    */}
        {/* ===================================================== */}
        <div className="auth-form-panel auth-signup-panel">
          {signUpSuccess ? (
            <div className="auth-success w-full max-w-xs">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-accent-primary/20 blur-md animate-ping" />
                <CheckCircle className="h-16 w-16 text-accent-primary relative z-10 animate-bounce" />
              </div>

              <h2 className="auth-heading text-2xl text-white">
                Account Created!
              </h2>

              <div className="rounded-xl border border-accent-primary/30 bg-accent-primary/5 p-4 text-sm text-text-primary space-y-2 text-center w-full">
                <ShieldAlert className="h-5 w-5 mx-auto text-accent-primary animate-pulse" />
                <p className="font-semibold">Verification Email Sent</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  We sent a verification link to your institutional email.
                  Please verify your email address to unlock your college academic workspace.
                </p>
                {signUpIsPending && (
                  <p className="text-[10px] text-accent-warning leading-relaxed mt-1">
                    Note: Since your domain is new, your college workspace status will be pending admin review, but you can browse and upload once verified.
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setSignUpSuccess(false);
                  toggleMode(false);
                }}
                className="auth-btn-primary"
              >
                Back to Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="w-full max-w-xs space-y-3">
              <div className="text-center mb-1">
                <h2 className="auth-heading text-2xl text-white">
                  Create Account
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Join your college&apos;s survival kit
                </p>
              </div>

              {signUpError && (
                <div className="auth-error">
                  <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
                  <span>{signUpError}</span>
                </div>
              )}

              {/* Name */}
              <div className="auth-input-wrap relative">
                <User className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  className="auth-input"
                  suppressHydrationWarning
                />
              </div>

              {/* Email */}
              <div className="auth-input-wrap relative">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="College Email (.edu / .ac.in)"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  className="auth-input"
                  suppressHydrationWarning
                />
              </div>

              {/* Password */}
              <div className="auth-input-wrap relative">
                <Lock className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Password (Min. 6 characters)"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                  suppressHydrationWarning
                />
              </div>

              {/* Dept + Year row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="auth-input-wrap relative">
                  <Building className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Dept (CSE)"
                    value={signUpDept}
                    onChange={(e) => setSignUpDept(e.target.value)}
                    className="auth-input"
                    suppressHydrationWarning
                  />
                </div>
                <div className="auth-input-wrap relative">
                  <Calendar className="auth-input-icon" />
                  <input
                    type="number"
                    placeholder="Year"
                    value={signUpYear}
                    onChange={(e) => setSignUpYear(e.target.value)}
                    className="auth-input"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={signUpLoading}
                className="auth-btn-primary mt-1"
                suppressHydrationWarning
              >
                {signUpLoading ? "Creating Account..." : "Sign Up"}
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Mobile toggle */}
              <div className="text-center mt-3 md:hidden">
                <p className="text-xs text-gray-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="text-accent-primary font-semibold underline hover:text-accent-primary-hover cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* ===================================================== */}
        {/* SIGN IN FORM PANEL                                    */}
        {/* ===================================================== */}
        <div className="auth-form-panel auth-signin-panel">
          {isForgot ? (
            <form onSubmit={handleForgotPassword} className="w-full max-w-xs space-y-4">
              <div className="text-center mb-2">
                <h2 className="auth-heading text-2xl text-white">Reset Password</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your registered institutional email to request a reset link
                </p>
              </div>

              {forgotError && (
                <div className="auth-error">
                  <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotMessage && (
                <div className="flex items-center gap-2 p-3 bg-accent-success/10 border border-accent-success/20 text-accent-success rounded-lg text-xs">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{forgotMessage}</span>
                </div>
              )}

              {/* Email */}
              <div className="auth-input-wrap relative">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="College Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="auth-input"
                  suppressHydrationWarning
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="auth-btn-primary"
                suppressHydrationWarning
              >
                {forgotLoading ? "Sending Link..." : "Send Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(false);
                    setForgotError("");
                    setForgotMessage("");
                  }}
                  className="text-xs text-accent-primary font-semibold underline hover:text-accent-primary-hover cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="w-full max-w-xs space-y-4">
              <div className="text-center mb-2">
                <h2 className="auth-heading text-2xl text-white">Welcome Back</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your credentials to access your sandbox
                </p>
              </div>

              {signInError && (
                <div className="auth-error">
                  <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
                  <span>{signInError}</span>
                </div>
              )}

              {/* Email */}
              <div className="auth-input-wrap relative">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="College Email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  className="auth-input"
                  suppressHydrationWarning
                />
              </div>

              {/* Password */}
              <div className="auth-input-wrap relative">
                <Lock className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  className="auth-input"
                  suppressHydrationWarning
                />
              </div>

              {/* Remember me + Forgot */}
              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center text-gray-400 cursor-pointer gap-1.5">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-white/10 bg-white/5 accent-accent-primary"
                    suppressHydrationWarning
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-gray-400 hover:text-white transition-colors hover:underline cursor-pointer bg-transparent border-0"
                  suppressHydrationWarning
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={signInLoading}
                className="auth-btn-primary"
                suppressHydrationWarning
              >
                {signInLoading ? "Signing In..." : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Mobile toggle */}
              <div className="text-center mt-3 md:hidden">
                <p className="text-xs text-gray-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className="text-accent-primary font-semibold underline hover:text-accent-primary-hover cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* ===================================================== */}
        {/* SLIDING GLASSMORPHIC OVERLAY (Desktop only)           */}
        {/* ===================================================== */}
        <div className="auth-overlay-container hidden md:block">
          <div className="auth-overlay">
            {/* Left Overlay Panel — shown when sign-up form is active */}
            <div className="auth-overlay-panel auth-overlay-left">
              <Image
                src="/logo.png"
                alt="BackBenchers Logo"
                width={200}
                height={80}
                className="auth-overlay-logo"
                priority
              />
              <h1 className="auth-heading text-3xl text-white leading-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-white/70 mt-3 mb-8 leading-relaxed max-w-[260px]">
                Stay synced with your campus workspace. Log in using your
                registered credentials.
              </p>
              <button
                onClick={() => toggleMode(false)}
                className="auth-btn-ghost"
                id="auth-signIn-toggle"
                suppressHydrationWarning
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay Panel — shown when sign-in form is active */}
            <div className="auth-overlay-panel auth-overlay-right">
              <Image
                src="/logo.png"
                alt="BackBenchers Logo"
                width={200}
                height={80}
                className="auth-overlay-logo"
                priority
              />
              <h1 className="auth-heading text-3xl text-white leading-tight">
                Hello, Friend!
              </h1>
              <p className="text-sm text-white/70 mt-3 mb-8 leading-relaxed max-w-[260px]">
                Join your university sandbox and start sharing files, PYQs, and
                class discussions instantly.
              </p>
              <button
                onClick={() => toggleMode(true)}
                className="auth-btn-ghost"
                id="auth-signUp-toggle"
                suppressHydrationWarning
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-4 z-10 text-center">
        <p className="text-[10px] text-white/30 tracking-wider uppercase">
          © 2026 Backbenchers · Peer-to-Peer Academic Platform
        </p>
      </div>
    </div>
  );
}
