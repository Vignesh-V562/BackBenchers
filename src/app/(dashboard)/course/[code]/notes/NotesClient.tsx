"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Flag, 
  FileText, 
  X
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const LIMIT = 5;

  // Fetch notes list from API
  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = `/api/documents?subjectId=${subjectId}&type=NOTES&sort=${sort}&page=${page}&limit=${LIMIT}`;
      if (selectedStaffId) {
        url += `&staffId=${selectedStaffId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch notes.");
      setNotes(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, selectedStaffId]);

  const handleVote = async (noteId: string, value: number) => {
    try {
      const res = await fetch(`/api/documents/${noteId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record vote.");

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
      await fetch(`/api/documents/${noteId}/download`, { method: "POST" });
      
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, downloads_count: n.downloads_count + 1 } : n
        )
      );

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
    if (!selectedFile) {
      toast.error("Please select a document file to upload.");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload file to server upload API
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "File upload failed.");
      }

      // 2. Submit document metadata
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          staffId: newStaffId || undefined,
          type: "NOTES",
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          fileUrl: uploadData.secure_url,
          fileType: uploadData.file_type,
          departmentId,
          year: parseInt(newYear, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload metadata failed.");

      setUploadOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewStaffId("");
      setSelectedFile(null);
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
      <div className="glass-toolbar flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Sorting */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-tertiary">Sort:</span>
            {["score", "newest"].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSort(opt);
                  setPage(1);
                }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                  sort === opt
                    ? "border-accent-primary/30 bg-accent-primary/10 text-accent-primary shadow-[0_0_8px_rgba(180,168,255,0.1)]"
                    : "border-white/[0.06] text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
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
                onChange={(e) => {
                  setSelectedStaffId(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-2 py-1.5 rounded-lg glass-form-control"
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
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-primary px-4 text-xs font-bold text-brand-primary hover:bg-accent-primary-hover shadow-lg hover:shadow-accent-primary/20 cursor-pointer transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Upload Notes
        </button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card flex items-start gap-4 p-5 animate-pulse select-none">
              <div className="w-10 h-10 rounded bg-white/[0.04] border border-white/[0.06] shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-white/[0.04] rounded-full" />
                  <div className="h-4 w-16 bg-white/[0.04] rounded-full" />
                </div>
                <div className="h-5 w-2/3 bg-white/[0.05] rounded" />
                <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="glass-empty p-12 text-center text-sm text-text-tertiary space-y-4">
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
              className="glass-card flex items-start gap-4 p-5"
            >
              {/* Upvote score controls */}
              <div className="glass-vote flex flex-col items-center gap-1 p-2 shrink-0 select-none">
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
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                    Year {note.year}
                  </span>
                  {note.staff_name && (
                    <span className="text-xs font-semibold text-accent-primary/80 bg-accent-primary/[0.06] px-2 py-0.5 rounded border border-accent-primary/10">
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
                <div className="flex items-center gap-3 pt-1 text-[10px] text-text-tertiary font-medium">
                  <span>Uploaded by {note.uploader_name}</span>
                  <span>•</span>
                  <span>{note.downloads_count} downloads</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-center">
                <button
                  onClick={() => handleDownload(note.id, note.file_url)}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer backdrop-blur-sm"
                  title="Open/Download Note"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedReportId(note.id);
                    setReportOpen(true);
                  }}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-accent-panic/[0.06] text-text-tertiary hover:text-accent-panic hover:border-accent-panic/15 transition-all cursor-pointer backdrop-blur-sm"
                  title="Report File"
                >
                  <Flag className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && (notes.length > 0 || page > 1) && (
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-6">
          <span className="text-xs text-text-tertiary">
            Page {page}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-bold hover:bg-white/[0.05] disabled:opacity-40 transition-all cursor-pointer text-white"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={notes.length < LIMIT}
              className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-bold hover:bg-white/[0.05] disabled:opacity-40 transition-all cursor-pointer text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Upload Note Dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-overlay">
          <div className="w-full max-w-md glass-modal p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
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
                  className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Description</label>
                <textarea
                  placeholder="Brief summary of notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg glass-form-control text-sm"
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
                    className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Staff / Professor</label>
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
                  >
                    <option value="">None / Other</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Select Document File (PDF, DOCX, JPG, PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/[0.05] file:text-text-primary hover:file:bg-white/[0.08] file:cursor-pointer bg-white/[0.02] border border-white/[0.06] rounded-lg p-2 focus:outline-none"
                />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-overlay">
          <div className="w-full max-w-sm glass-modal p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
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
                  className="w-full h-24 p-3 rounded-lg glass-form-control text-sm"
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
