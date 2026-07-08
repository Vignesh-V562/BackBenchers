"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm text-xs font-bold text-text-secondary hover:text-accent-panic hover:bg-accent-panic/[0.06] hover:border-accent-panic/20 transition-all duration-200 cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
