import { HelpCircle, ExternalLink } from "lucide-react";

export default function KitPage() {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-12 text-center text-sm text-text-secondary max-w-2xl mx-auto space-y-4 my-10 backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-warning/10 text-accent-warning mx-auto">
        <HelpCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-text-primary">Last-Minute Curated Kits</h3>
      <p className="text-xs text-text-secondary leading-relaxed">
        Curated Kits are collection bundles of notes, syllabus trackers, and expected questions posted by professors or department representatives.
      </p>
      <div className="rounded-lg border border-brand-border bg-brand-elevated/40 p-4 text-xs italic">
        No curated study kits are currently active for this course. Check back closer to your exam dates!
      </div>
    </div>
  );
}
