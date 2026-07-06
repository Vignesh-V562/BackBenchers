"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Flag, 
  ArrowLeft,
  X,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocDetail {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  year: number;
  type: string;
  exam_category: string | null;
  upvotes_count: number;
  downloads_count: number;
  uploader_name: string;
  subject_name: string;
  subject_code: string;
  score: number;
}

export default function DocumentDetailClient({
  doc,
  initialUserVote,
  user,
}: {
  doc: DocDetail;
  initialUserVote: number;
  user: any;
}) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(doc.upvotes_count);
  const [downloads, setDownloads] = useState(doc.downloads_count);
  const [userVote, setUserVote] = useState(initialUserVote);
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleVote = async (value: number) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit vote.");

      setUpvotes(data.upvotes_count);
      setDownloads(data.downloads_count);
      setUserVote(data.user_vote);
      toast.success(data.user_vote !== 0 ? "Vote recorded." : "Vote removed.");
    } catch (err: any) {
      toast.error(err.message || "Could not vote.");
    }
  };

  const handleDownload = async () => {
    try {
      await fetch(`/api/documents/${doc.id}/download`, { method: "POST" });
      setDownloads((prev) => prev + 1);
      window.open(doc.file_url, "_blank");
      toast.success("Download tracked.");
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      const res = await fetch(`/api/documents/${doc.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (!res.ok) throw new Error("Failed to file report.");

      setReportOpen(false);
      setReportReason("");
      toast.success("Report submitted.");
    } catch (err: any) {
      toast.error("Error submitting report.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Document Meta Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-accent-primary bg-semantic-course-badge-bg px-2 py-0.5 rounded border border-accent-primary/20">
              {doc.subject_code.toUpperCase()}
            </span>
            <span className="text-xs text-text-tertiary uppercase tracking-wider font-bold">
              {doc.subject_name} • Year {doc.year}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{doc.title}</h2>
          <p className="text-xs text-text-tertiary">
            Uploaded by {doc.uploader_name} • {downloads} downloads
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Vote Controls */}
          <div className="flex items-center gap-1.5 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-full select-none">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "p-1 hover:text-accent-primary transition-all cursor-pointer",
                userVote === 1 ? "text-accent-primary" : "text-text-tertiary"
              )}
              title="Upvote"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold font-mono px-1">
              {upvotes}
            </span>
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "p-1 hover:text-accent-panic transition-all cursor-pointer",
                userVote === -1 ? "text-accent-panic" : "text-text-tertiary"
              )}
              title="Downvote"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-primary px-4 text-xs font-bold text-brand-primary hover:bg-accent-primary-hover shadow-lg cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>

          <button
            onClick={() => setReportOpen(true)}
            className="p-2.5 rounded-full border border-brand-border bg-brand-surface hover:bg-accent-panic-glow text-text-tertiary hover:text-accent-panic hover:border-accent-panic/10 transition-all cursor-pointer"
            title="Report File"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {doc.description && (
        <div className="rounded-xl border border-brand-border bg-brand-surface/40 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1">Description</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{doc.description}</p>
        </div>
      )}

      {/* PDF View Frame */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden shadow-card">
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(doc.file_url)}&embedded=true`}
          className="w-full h-[650px] border-0"
          title="Document Preview"
        />
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-bold text-base text-accent-panic">Report Document</h3>
              <button onClick={() => setReportOpen(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleReport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Reason for Reporting</label>
                <textarea
                  placeholder="Why should this document be reviewed?"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full h-24 p-3 rounded-lg bg-brand-elevated border border-brand-border text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-accent-panic text-sm font-bold text-brand-primary hover:bg-accent-panic-hover transition-all"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
