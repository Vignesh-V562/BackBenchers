"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
      <div className="w-full max-w-md glass-card p-8 space-y-6 text-center animate-fade-in-up">
        {/* Error icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-accent-panic/10 blur-lg animate-pulse" />
          <AlertTriangle className="h-16 w-16 text-accent-panic relative z-10 animate-bounce-slow" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight text-white">Something went wrong!</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            An unexpected error occurred while loading this dashboard view.
          </p>
          {error.message && (
            <p className="text-xs font-mono text-accent-panic bg-accent-panic/10 border border-accent-panic/15 rounded-lg p-3 select-all max-h-24 overflow-y-auto">
              {error.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-sm font-bold text-text-primary transition-all cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
