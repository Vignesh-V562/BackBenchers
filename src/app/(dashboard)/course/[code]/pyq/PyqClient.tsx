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
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PYQ {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  year: number;
  exam_category: string | null;
  upvotes_count: number;
  downloads_count: number;
  created_at: string;
  uploader_name: string;
  staff_name: string | null;
  score: number;
  user_vote: number;
}

export default function PyqClient({
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
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  // New PYQ form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStaffId, setNewStaffId] = useState("");
  const [newYear, setNewYear] = useState("2025");
  const [newCategory, setNewCategory] = useState("ENDSEM");
  const [uploading, setUploading] = useState(false);

  const fetchPyqs = async () => {
    setLoading(true);
    try {
      let url = `/api/documents?subjectId=${subjectId}&type=QUESTION_PAPER`;
      if (selectedCategory) {
        url += `&examCategory=${selectedCategory}`;
      }
      if (selectedYear) {
        url += `&year=${selectedYear}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load question papers.");
      setPyqs(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve PYQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPyqs();
  }, [selectedCategory, selectedYear]);

  const handleVote = async (pyqId: string, value: number) => {
    try {
      const res = await fetch(`/api/documents/${pyqId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to vote.");

      setPyqs((prev) =>
        prev.map((p) =>
          p.id === pyqId
            ? {
                ...p,
                upvotes_count: data.upvotes_count,
                downloads_count: data.downloads_count,
                score: data.score,
                user_vote: data.user_vote,
              }
            : p
        )
      );
      toast.success(data.user_vote !== 0 ? "Vote recorded." : "Vote removed.");
    } catch (err: any) {
      toast.error(err.message || "Could not vote.");
    }
  };

  const handleDownload = async (pyqId: string, fileUrl: string) => {
    try {
      await fetch(`/api/documents/${pyqId}/download`, { method: "POST" });
      setPyqs((prev) =>
        prev.map((p) =>
          p.id === pyqId ? { ...p, downloads_count: p.downloads_count + 1 } : p
        )
      );
      window.open(fileUrl, "_blank");
      toast.success("Download logged.");
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
      if (!res.ok) throw new Error("Failed to file report.");

      setReportOpen(false);
      setReportReason("");
      setSelectedReportId(null);
      toast.success("Report submitted.");
    } catch (err: any) {
      toast.error("Error submitting report.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newYear || !newCategory) {
      toast.error("Please fill required fields.");
      return;
    }

    setUploading(true);
    const mockFileUrl = "https://res.cloudinary.com/demo/image/upload/sample.pdf";
    const mockFileType = "pdf";

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          staffId: newStaffId || undefined,
          type: "QUESTION_PAPER",
          examCategory: newCategory,
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
      fetchPyqs();
      toast.success("Question paper uploaded successfully.");
    } catch (err: any) {
      toast.error(err.message || "Error uploading paper.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-surface/40 p-4 rounded-xl border border-brand-border backdrop-blur-xl">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter by Exam Category */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-tertiary">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg bg-brand-elevated border border-brand-border text-text-secondary focus:outline-none focus:border-accent-primary"
            >
              <option value="">All Exams</option>
              <option value="CIA1">CIA 1</option>
              <option value="CIA2">CIA 2</option>
              <option value="MIDSEM">Mid-Semester</option>
              <option value="ENDSEM">End-Semester</option>
            </select>
          </div>

          {/* Filter by Year */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-tertiary">Year:</span>
            <input
              type="number"
              placeholder="All Years"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs w-20 px-2 py-1 rounded-lg bg-brand-elevated border border-brand-border text-text-secondary focus:outline-none focus:border-accent-primary placeholder:text-text-tertiary"
            />
          </div>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-primary px-4 text-xs font-bold text-brand-primary hover:bg-accent-primary-hover shadow-lg cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Upload PYQ
        </button>
      </div>

      {/* PYQs List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-text-tertiary">
          Loading question papers...
        </div>
      ) : pyqs.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-12 text-center text-sm text-text-tertiary space-y-4">
          <GraduationCap className="h-10 w-10 text-text-tertiary mx-auto opacity-40 animate-pulse" />
          <p>No previous year question papers uploaded for this course yet.</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="text-xs text-accent-primary hover:underline font-bold"
          >
            Be the first to upload a question paper
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {pyqs.map((pyq) => (
            <div 
              key={pyq.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-brand-border bg-brand-surface/50 backdrop-blur-xl shadow-card hover:border-brand-border-strong transition-all duration-300"
            >
              {/* Score controls */}
              <div className="flex flex-col items-center gap-1 bg-brand-elevated/40 p-2 rounded-lg border border-brand-border shrink-0 select-none">
                <button
                  onClick={() => handleVote(pyq.id, 1)}
                  className={cn(
                    "p-1 hover:text-accent-primary transition-colors cursor-pointer",
                    pyq.user_vote === 1 ? "text-accent-primary" : "text-text-tertiary"
                  )}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span className="text-xs font-bold font-mono">
                  {pyq.upvotes_count}
                </span>
                <button
                  onClick={() => handleVote(pyq.id, -1)}
                  className={cn(
                    "p-1 hover:text-accent-panic transition-colors cursor-pointer",
                    pyq.user_vote === -1 ? "text-accent-panic" : "text-text-tertiary"
                  )}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-2 py-0.5 rounded-full">
                    {pyq.exam_category}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary bg-brand-elevated px-2 py-0.5 rounded border border-brand-border">
                    Year {pyq.year}
                  </span>
                  {pyq.staff_name && (
                    <span className="text-xs font-semibold text-accent-primary/80 bg-accent-primary/5 px-2 py-0.5 rounded border border-accent-primary/10">
                      Prof. {pyq.staff_name}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-text-primary leading-snug">
                  {pyq.title}
                </h4>
                {pyq.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {pyq.description}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-2 text-[10px] text-text-tertiary font-medium">
                  <span>Uploaded by {pyq.uploader_name}</span>
                  <span>•</span>
                  <span>{pyq.downloads_count} downloads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 self-center">
                <button
                  onClick={() => handleDownload(pyq.id, pyq.file_url)}
                  className="p-2.5 rounded-lg border border-brand-border bg-brand-elevated/40 hover:bg-brand-elevated text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title="Open Question Paper"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedReportId(pyq.id);
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

      {/* Upload PYQ Dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-bold text-base">Upload Question Paper</h3>
              <button onClick={() => setUploadOpen(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Paper Title</label>
                <input
                  type="text"
                  placeholder="e.g. CIA 1 - Network Layers & Framing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Exam Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    required
                    className="w-full h-10 px-4 rounded-lg bg-brand-elevated border border-brand-border text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Exam Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg bg-brand-elevated border border-brand-border text-sm text-text-primary"
                  >
                    <option value="CIA1">CIA 1</option>
                    <option value="CIA2">CIA 2</option>
                    <option value="MIDSEM">Mid-Semester</option>
                    <option value="ENDSEM">End-Semester</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
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

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Description</label>
                <textarea
                  placeholder="Optional notes or details about the questions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full h-20 p-3 rounded-lg bg-brand-elevated border border-brand-border text-sm focus:outline-none"
                />
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
                {uploading ? "Submitting paper..." : "Upload Question Paper"}
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
                  placeholder="Describe why this paper is flagged..."
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
