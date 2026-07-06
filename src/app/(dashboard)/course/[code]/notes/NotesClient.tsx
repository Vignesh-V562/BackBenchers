"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Flag, 
  FileText, 
  X,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  year: number;
  upvotes_count: number;
  downloads_count: number;
  created_at: string;
  uploader_name: string;
  staff_name: string | null;
  score: number;
  user_vote: number;
}

export default function NotesClient({
  subjectId,
  departmentId,
  staffList,
  user,
}: {
  subjectId: string;
  departmentId: string;
  staffList: any[];
  user: any;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("score");
  const [selectedStaffId, setSelectedStaffId] = useState("");

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  // New Note form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStaffId, setNewStaffId] = useState("");
  const [newYear, setNewYear] = useState("2026");
  const [uploading, setUploading] = useState(false);

  // Fetch notes list from API
  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = `/api/documents?subjectId=${subjectId}&type=NOTES&sort=${sort}`;
      if (selectedStaffId) {
        url += `&staffId=${selectedStaffId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notes.");
      setNotes(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve study notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [sort, selectedStaffId]);

  const handleVote = async (noteId: string, value: number) => {
    try {
      const res = await fetch(`/api/documents/${noteId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record vote.");

      // Update notes list state locally
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                upvotes_count: data.upvotes_count,
                downloads_count: data.downloads_count,
                score: data.score,
                user_vote: data.user_vote,
              }
            : n
        ).sort((a, b) => (sort === "score" ? b.score - a.score : 0))
      );

      toast.success(data.user_vote !== 0 ? "Vote recorded." : "Vote removed.");
    } catch (err: any) {
      toast.error(err.message || "Could not vote.");
    }
  };

  const handleDownload = async (noteId: string, fileUrl: string) => {
    try {
      // 1. Log download count on server
      await fetch(`/api/documents/${noteId}/download`, { method: "POST" });
      
      // Update local state
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, downloads_count: n.downloads_count + 1 } : n
        )
      );

      // 2. Open PDF in a new tab
      window.open(fileUrl, "_blank");
      toast.success("Download started.");
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/documents/${selectedReportId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report.");

      setReportOpen(false);
      setReportReason("");
      setSelectedReportId(null);
      toast.success("Document has been reported.");
    } catch (err: any) {
      toast.error(err.message || "Error submitting report.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newYear) {
      toast.error("Please fill required fields.");
      return;
    }

    setUploading(true);

    // Mock upload path if Cloudinary keys aren't set
    // Uses Cloudflare's sample raw PDF
    const mockFileUrl = "https://res.cloudinary.com/demo/image/upload/sample.pdf";
    const mockFileType = "pdf";

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          staffId: newStaffId || undefined,
          type: "NOTES",
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          fileUrl: mockFileUrl,
          fileType: mockFileType,
          departmentId,
          year: parseInt(newYear, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setUploadOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewStaffId("");
      fetchNotes();
      toast.success("Note uploaded for moderation review.");
    } catch (err: any) {
      toast.error(err.message || "Error uploading note.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Sort Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-surface/40 p-4 rounded-xl border border-brand-border backdrop-blur-xl">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Sorting */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-tertiary">Sort:</span>
            {["score", "newest"].map((opt) => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition-all cursor-pointer",
                  sort === opt
                    ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                    : "border-brand-border text-text-secondary hover:text-text-primary"
                )}
              >
                {opt === "score" ? "Top Score" : "Recent"}
              </button>
            ))}
          </div>

          {/* Filter by Staff */}
          {staffList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-tertiary">Staff:</span>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg bg-brand-elevated border border-brand-border text-text-secondary focus:outline-none focus:border-accent-primary"
              >
                <option value="">All Staff</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-primary px-4 text-xs font-bold text-brand-primary hover:bg-accent-primary-hover shadow-lg cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Upload Notes
        </button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-text-tertiary">
          Loading course notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-12 text-center text-sm text-text-tertiary space-y-4">
          <FileText className="h-10 w-10 text-text-tertiary mx-auto opacity-40 animate-pulse" />
          <p>No study notes have been uploaded for this course yet.</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="text-xs text-accent-primary hover:underline font-bold"
          >
            Be the first to upload notes
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div 
              key={note.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-brand-border bg-brand-surface/50 backdrop-blur-xl shadow-card hover:border-brand-border-strong transition-all duration-300"
            >
              {/* Upvote score controls */}
              <div className="flex flex-col items-center gap-1 bg-brand-elevated/40 p-2 rounded-lg border border-brand-border shrink-0 select-none">
                <button
                  onClick={() => handleVote(note.id, 1)}
                  className={cn(
                    "p-1 hover:text-accent-primary transition-colors cursor-pointer",
                    note.user_vote === 1 ? "text-accent-primary" : "text-text-tertiary"
                  )}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span className="text-xs font-bold font-mono">
                  {note.upvotes_count}
                </span>
                <button
                  onClick={() => handleVote(note.id, -1)}
                  className={cn(
                    "p-1 hover:text-accent-panic transition-colors cursor-pointer",
                    note.user_vote === -1 ? "text-accent-panic" : "text-text-tertiary"
                  )}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              {/* Document details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary bg-brand-elevated px-2 py-0.5 rounded border border-brand-border">
                    Year {note.year}
                  </span>
                  {note.staff_name && (
                    <span className="text-xs font-semibold text-accent-primary/80 bg-accent-primary/5 px-2 py-0.5 rounded border border-accent-primary/10">
                      Prof. {note.staff_name}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-text-primary leading-snug">
                  {note.title}
                </h4>
                {note.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-2 text-[10px] text-text-tertiary font-medium">
                  <span>Uploaded by {note.uploader_name}</span>
                  <span>•</span>
                  <span>{note.downloads_count} downloads</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 self-center">
                <button
                  onClick={() => handleDownload(note.id, note.file_url)}
                  className="p-2.5 rounded-lg border border-brand-border bg-brand-elevated/40 hover:bg-brand-elevated text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title="Open/Download Note"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedReportId(note.id);
                    setReportOpen(true);
                  }}
                  className="p-2.5 rounded-lg border border-brand-border bg-brand-elevated/40 hover:bg-accent-panic-glow text-text-tertiary hover:text-accent-panic hover:border-accent-panic/10 transition-all cursor-pointer"
                  title="Report File"
                >
                  <Flag className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Note Dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-bold text-base">Upload Study Notes</h3>
              <button onClick={() => setUploadOpen(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 - Sliding Window Protocol"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Description</label>
                <textarea
                  placeholder="Brief summary of notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg bg-brand-elevated border border-brand-border text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Year of Study</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    required
                    className="w-full h-10 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Staff / Professor</label>
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary"
                  >
                    <option value="">None / Other</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-brand-border bg-brand-elevated/40 p-4 text-center border-dashed">
                <FileText className="h-8 w-8 text-text-tertiary mx-auto mb-2 opacity-55" />
                <p className="text-xs text-text-secondary">Cloudinary file sync active.</p>
                <p className="text-[10px] text-text-tertiary">Files are isolated to college storage namespaces.</p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all"
              >
                {uploading ? "Submitting notes..." : "Upload Notes"}
              </button>
            </form>
          </div>
        </div>
      )}

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
                  placeholder="e.g. Contains incorrect details, copyright violation, spam..."
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
