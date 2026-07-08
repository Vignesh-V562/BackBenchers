"use client";

import { useState } from "react";
import { 
  Building2, 
  Check, 
  X
} from "lucide-react";
import { toast } from "sonner";

interface College {
  id: string;
  name: string;
  domain: string;
  slug: string;
  status: string;
  created_at: string;
}

export default function CollegesAdminClient({
  initialColleges,
}: {
  initialColleges: any[];
}) {
  const [colleges, setColleges] = useState<College[]>(initialColleges);

  const handleAction = async (collegeId: string, action: "verify" | "suspend") => {
    try {
      const res = await fetch(`/api/admin/colleges/${collegeId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update college status.");

      setColleges((prev) => prev.filter((c) => c.id !== collegeId));
      toast.success(action === "verify" ? "College domain verified successfully." : "College suspended.");
    } catch (err: any) {
      toast.error(err.message || "Error processing verification request.");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
        Pending College Approvals ({colleges.length})
      </h3>

      {colleges.length === 0 ? (
        <div className="glass-empty p-12 text-center text-sm text-text-tertiary space-y-2">
          <Check className="h-8 w-8 text-accent-success mx-auto" />
          <p className="font-semibold text-text-primary">Inbox Zero!</p>
          <p className="text-xs">No pending college verification requests are in the queue.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {colleges.map((col) => (
            <div 
              key={col.id}
              className="glass-card flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-accent-primary/10 border border-accent-primary/25 rounded-xl flex items-center justify-center text-accent-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">{col.name}</h4>
                  <p className="text-xs text-text-secondary font-mono">{col.domain}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    Registered on {new Date(col.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(col.id, "verify")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent-success px-4 text-xs font-bold text-brand-primary hover:bg-accent-success/90 cursor-pointer shadow-lg hover:shadow-accent-success/15 transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                  Verify
                </button>
                <button
                  onClick={() => handleAction(col.id, "suspend")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-accent-panic/[0.06] text-text-secondary hover:text-accent-panic hover:border-accent-panic/20 px-4 text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
