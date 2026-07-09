"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, HelpCircle, UserCheck, Search, Trophy, FileText } from "lucide-react";
import SignOutButton from "./SignOutButton";

interface MobileNavProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  isSuperAdmin: boolean;
}

export default function MobileNav({ user, isSuperAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer backdrop-blur-sm"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Drawer Overlay & Content */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop backdrop blur */}
          <div
            className="fixed inset-0 bg-brand-primary/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />

          {/* Sliding Glassmorphic Panel */}
          <div className="relative w-72 max-w-[85vw] h-full flex flex-col bg-brand-surface/95 border-l border-white/[0.08] backdrop-blur-xl p-6 shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
              <span className="font-bold text-base bg-gradient-to-r from-text-primary to-accent-primary bg-clip-text text-transparent">
                Backbenchers
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-text-tertiary hover:text-text-primary transition-all cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 space-y-1.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all group"
              >
                <LayoutDashboard className="h-4.5 w-4.5 text-text-secondary group-hover:text-accent-primary transition-colors" />
                College Dashboard
              </Link>

              <Link
                href="/documents"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all group"
              >
                <Search className="h-4.5 w-4.5 text-text-secondary group-hover:text-accent-primary transition-colors" />
                Global Search
              </Link>

              <Link
                href="/leaderboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all group"
              >
                <Trophy className="h-4.5 w-4.5 text-text-secondary group-hover:text-accent-primary transition-colors" />
                Top Materials
              </Link>

              <Link
                href="/my-submissions"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all group"
              >
                <FileText className="h-4.5 w-4.5 text-text-secondary group-hover:text-accent-primary transition-colors" />
                My Submissions
              </Link>

              <Link
                href="/dashboard/qa"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all group"
              >
                <HelpCircle className="h-4.5 w-4.5 text-text-secondary group-hover:text-accent-primary transition-colors" />
                Q&A Board
              </Link>

              {isSuperAdmin && (
                <Link
                  href="/admin/colleges"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-accent-primary bg-accent-primary/[0.06] hover:bg-accent-primary/[0.12] border border-accent-primary/15 transition-all"
                >
                  <UserCheck className="h-4.5 w-4.5" />
                  Super Admin Panel
                </Link>
              )}
            </nav>

            {/* Profile Footer */}
            <div className="border-t border-white/[0.06] pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-9 w-9 rounded-full bg-accent-primary/10 border border-accent-primary/25 flex items-center justify-center font-bold text-accent-primary text-sm shadow-[0_0_12px_rgba(180,168,255,0.1)]">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                    {user.role}
                  </p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
