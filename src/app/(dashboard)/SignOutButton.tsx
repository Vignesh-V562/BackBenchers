"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full h-10 items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-elevated/40 text-xs font-bold text-text-secondary hover:text-accent-panic hover:bg-accent-panic-glow hover:border-accent-panic/20 transition-all cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
