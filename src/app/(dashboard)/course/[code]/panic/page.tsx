import { Flame } from "lucide-react";

export default function PanicPage() {
  return (
    <div className="glass-card p-12 text-center text-sm text-text-secondary max-w-2xl mx-auto space-y-4 my-10 !border-accent-panic/15">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-panic/10 text-accent-panic mx-auto animate-pulse">
        <Flame className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-accent-panic">Entering Panic Mode...</h3>
      <p className="text-xs text-text-secondary leading-relaxed">
        Panic Mode is an AI exam-survival companion. Once activated, it extracts and summarizes text from scanned notes, generates immediate practice mock quiz sheets, and formats step-by-step solutions for subjects.
      </p>
      <div className="rounded-lg border border-accent-panic/10 bg-accent-panic/[0.03] p-4 text-xs font-semibold">
        Panic Mode features are currently locked. System integration scheduled for Phase 2 launch!
      </div>
    </div>
  );
}
