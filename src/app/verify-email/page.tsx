"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The token may be invalid or expired.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("A network error occurred while verifying your email.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="w-full max-w-md glass-card p-8 space-y-6 text-center animate-fade-in-up">
      {status === "loading" && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 text-accent-primary animate-spin" />
          <h2 className="text-xl font-bold text-white">Verifying Email</h2>
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent-success/20 blur-md animate-ping" />
            <CheckCircle className="h-16 w-16 text-accent-success relative z-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-white">Email Verified!</h2>
          <p className="text-sm text-text-secondary">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover transition-all flex items-center justify-center gap-2 mt-2"
          >
            Go to Sign In
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="h-16 w-16 text-accent-panic animate-pulse" />
          <h2 className="text-xl font-bold text-white">Verification Failed</h2>
          <p className="text-sm text-text-panic bg-accent-panic/10 border border-accent-panic/20 rounded-lg p-3 w-full">
            {message}
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-sm font-bold text-text-primary transition-all flex items-center justify-center gap-2 mt-2"
          >
            Back to Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
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
