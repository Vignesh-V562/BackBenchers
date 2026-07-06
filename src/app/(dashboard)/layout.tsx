import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryD1 } from "@/lib/d1";
import Link from "next/link";
import { 
  GraduationCap, 
  LayoutDashboard, 
  FolderLock, 
  HelpCircle, 
  Settings, 
  ShieldAlert,
  LogOut,
  UserCheck
} from "lucide-react";
import SignOutButton from "./SignOutButton";

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
    <div className="flex min-h-screen bg-brand-primary text-text-primary">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-brand-border bg-brand-surface/40 backdrop-blur-xl shrink-0">
        {/* Logo area */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-brand-border">
          <GraduationCap className="h-6 w-6 text-accent-primary" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-text-primary to-accent-primary bg-clip-text text-transparent">
            Backbenchers
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-brand-elevated transition-all duration-150"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Dashboard
          </Link>

          <Link
            href="/my-submissions"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-brand-elevated transition-all duration-150"
          >
            <FolderLock className="h-4.5 w-4.5" />
            My Submissions
          </Link>

          <Link
            href="/dashboard/qa"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-brand-elevated transition-all duration-150"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            Q&A Board
          </Link>

          {isSuperAdmin && (
            <Link
              href="/admin/colleges"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10 border border-accent-primary/20 transition-all duration-150"
            >
              <UserCheck className="h-4.5 w-4.5" />
              Super Admin Panel
            </Link>
          )}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-brand-border bg-brand-surface/20 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center font-bold text-accent-primary">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">
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
        <header className="h-16 border-b border-brand-border bg-brand-primary/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-accent-primary md:hidden" />
            <div>
              <h1 className="text-base font-bold truncate max-w-[200px] sm:max-w-md">
                {college.name}
              </h1>
              {isPending && (
                <span className="text-[10px] text-accent-warning bg-semantic-kit-badge-bg px-2 py-0.5 rounded-full font-semibold border border-accent-warning/20">
                  Verification Pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="md:hidden h-8 w-8 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center font-bold text-accent-primary text-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs text-text-secondary bg-brand-elevated px-3 py-1 rounded-full border border-brand-border">
              {user.email}
            </span>
          </div>
        </header>

        {/* Warning banner for pending colleges */}
        {isPending && (
          <div className="bg-accent-warning/5 border-b border-accent-warning/20 px-6 py-2.5 flex items-center gap-3 text-xs text-accent-warning select-none">
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
