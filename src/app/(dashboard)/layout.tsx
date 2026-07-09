import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { queryD1 } from "@/lib/d1";
import Link from "next/link";
import { 
  GraduationCap, 
  LayoutDashboard, 
  HelpCircle, 
  ShieldAlert,
  UserCheck,
  Search,
  Trophy,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "./SignOutButton";
import MobileNav from "./MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // Fetch college name and verification status from DB
  const { results: colleges } = await queryD1(
    "SELECT name, status FROM colleges WHERE id = ? LIMIT 1",
    [user.collegeId]
  );
  
  const college = colleges[0] || { name: "Your College", status: "PENDING" };
  const isPending = college.status === "PENDING";
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen text-text-primary relative z-0">
      {/* Fixed App Backdrop — visible through all glass panels */}
      <div className="app-backdrop" />

      {/* Grain Noise Overlay for texture */}
      <div className="app-noise">
        <svg className="w-full h-full opacity-[0.05] mix-blend-overlay" pointerEvents="none">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col glass-sidebar shrink-0">
        {/* Logo area */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/[0.06]">
          <div className="h-8 w-8 rounded-lg bg-accent-primary/15 flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5 text-accent-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-text-primary to-accent-primary bg-clip-text text-transparent">
            Backbenchers
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            College Dashboard
          </Link>

          <Link
            href="/documents"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
            )}
          >
            <Search className="h-5 w-5" />
            Global Search
          </Link>

          <Link
            href="/leaderboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
            )}
          >
            <Trophy className="h-5 w-5" />
            Top Materials
          </Link>

          <Link
            href="/my-submissions"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
            )}
          >
            <FileText className="h-5 w-5" />
            My Submissions
          </Link>

          <Link
            href="/dashboard/qa"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200 group"
          >
            <HelpCircle className="h-4.5 w-4.5 group-hover:text-accent-primary transition-colors" />
            Q&A Board
          </Link>

          {isSuperAdmin && (
            <Link
              href="/admin/colleges"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-accent-primary bg-accent-primary/[0.06] hover:bg-accent-primary/[0.12] border border-accent-primary/15 transition-all duration-200"
            >
              <UserCheck className="h-4.5 w-4.5" />
              Super Admin Panel
            </Link>
          )}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-accent-primary/10 border border-accent-primary/25 flex items-center justify-center font-bold text-accent-primary text-sm shadow-[0_0_12px_rgba(180,168,255,0.1)]">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">
                {user.role}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 glass-header flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-accent-primary md:hidden" />
            <div>
              <h1 className="text-base font-bold truncate max-w-[200px] sm:max-w-md">
                {college.name}
              </h1>
              {isPending && (
                <span className="text-[10px] text-accent-warning bg-accent-warning/[0.08] px-2 py-0.5 rounded-full font-semibold border border-accent-warning/20">
                  Verification Pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-text-secondary bg-white/[0.04] backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/[0.06]">
              {user.email}
            </span>
            <MobileNav user={user} isSuperAdmin={isSuperAdmin} />
          </div>
        </header>

        {/* Warning banner for pending colleges */}
        {isPending && (
          <div className="bg-accent-warning/[0.04] backdrop-blur-md border-b border-accent-warning/15 px-6 py-2.5 flex items-center gap-3 text-xs text-accent-warning select-none">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-accent-warning" />
            <p>
              <strong>Notice:</strong> Your college workspace is currently pending verification. You can browse and upload notes immediately, but public visibility index listings will be locked until verified.
            </p>
          </div>
        )}

        {/* Body content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
