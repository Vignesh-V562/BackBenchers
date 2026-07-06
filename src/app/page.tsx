import Link from "next/link";
import { GraduationCap, ShieldAlert, BookOpen, HelpCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-primary text-text-primary">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-primary/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent-primary" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-text-primary via-accent-primary to-accent-primary-hover bg-clip-text text-transparent">
              Backbenchers
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-full bg-accent-primary px-4 text-sm font-semibold text-brand-primary hover:bg-accent-primary-hover transition-all shadow-lg hover:shadow-accent-primary/20"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Ambient glow backgrounds */}
          <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary-glow blur-[100px]" />
          
          <div className="container mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3 py-1 text-xs font-semibold text-accent-primary mb-6">
              🏫 Sandboxed Multi-College Network
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-tight bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">
              Your College's Knowledge, Walled-Off and Organized.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
              Share class notes, download past year question papers, and run scoped Q&A threads. Completely isolated to your college domain.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent-primary px-8 text-base font-bold text-brand-primary hover:bg-accent-primary-hover transition-all shadow-xl hover:shadow-accent-primary/20 hover:-translate-y-0.5"
              >
                Sign Up with College Email
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-brand-border bg-brand-surface px-8 text-base font-bold text-text-primary hover:bg-brand-elevated transition-all hover:border-brand-border-strong hover:-translate-y-0.5"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 border-t border-brand-border bg-brand-surface/40">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built For Students, Isolated By Domain
              </h2>
              <p className="mt-4 text-text-secondary">
                No overlapping data, no noise. Your feed contains only courses, departments, and exams relevant to your university.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card hover:border-brand-border-strong transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary mb-6">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">College Gated Access</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Signup is filtered by your email domain. Students from other colleges cannot view your notes or access your college page.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card hover:border-brand-border-strong transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-success/10 text-accent-success mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">PYQs & Study Guides</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Filter question papers by CIA1, CIA2, Midsem, and Endsem. Search files by subject course code or staff member name.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card hover:border-brand-border-strong transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-panic/10 text-accent-panic mb-6">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Internal Q&A Board</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Ask study questions, write solutions, and upvote answers. Mark accepted answers to reward top backbench contributors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Alert Section */}
        <section className="py-16 border-t border-brand-border bg-brand-primary">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-accent-panic/20 bg-accent-panic-glow p-8 md:p-10">
              <ShieldAlert className="h-12 w-12 text-accent-panic shrink-0 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-accent-panic mb-2">Is My College Registered?</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  If you sign up and your college domain is not yet on our list, we automatically create a pending workspace. You can still upload and access files immediately while our admin verifies the domain!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-brand-surface/20 py-8 text-center text-xs text-text-tertiary">
        <div className="container mx-auto px-4">
          <p>© 2026 Backbenchers platform. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
