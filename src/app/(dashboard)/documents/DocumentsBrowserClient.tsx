"use client";

import { useState, useEffect } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Search,
  FileText,
  BookOpen,
  Filter,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  type: string;
  year: number;
  upvotes_count: number;
  downloads_count: number;
  created_at: string;
  uploader_name: string;
  staff_name: string | null;
  subject_name: string;
  subject_code: string;
  score: number;
  user_vote: number;
}

export default function DocumentsBrowserClient({
  initialSubjects,
  initialStaff,
}: {
  initialSubjects: any[];
  initialStaff: any[];
}) {
  const [documents, setDocuments] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("score");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedCourseCode, setSelectedCourseCode] = useState("");
  const [selectedType, setSelectedType] = useState(""); // empty = all
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = `/api/documents?sort=${sort}&page=${page}&limit=${LIMIT}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (selectedStaffId) url += `&staffId=${selectedStaffId}`;
      if (selectedCourseCode) url += `&courseCode=${encodeURIComponent(selectedCourseCode)}`;
      if (selectedType) url += `&type=${selectedType}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch documents.");
      setDocuments(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [debouncedSearch, sort, selectedStaffId, selectedCourseCode, selectedType, page]);

  const handleVote = async (noteId: string, value: number) => {
    try {
      const res = await fetch(`/api/documents/${noteId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record vote.");

      setDocuments((prev) =>
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
        )
      );

      toast.success(data.user_vote !== 0 ? "Vote recorded." : "Vote removed.");
    } catch (err: any) {
      toast.error(err.message || "Could not vote.");
    }
  };

  const handleDownload = async (noteId: string, fileUrl: string) => {
    try {
      await fetch(`/api/documents/${noteId}/download`, { method: "POST" });
      
      setDocuments((prev) =>
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

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="glass-card p-4 space-y-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by title, subject, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-12 text-sm rounded-xl glass-form-control shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 text-text-tertiary hover:text-text-secondary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/[0.02] px-2 py-1.5 rounded-lg border border-white/[0.06]">
            <Filter className="h-3.5 w-3.5 text-text-tertiary ml-1" />
            <span className="text-xs font-semibold text-text-tertiary pr-1">Filters:</span>
            
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              className="text-xs px-2 py-1 rounded bg-transparent text-text-secondary focus:outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="NOTES">Notes</option>
              <option value="QUESTION_PAPER">Question Papers</option>
            </select>

            <select
              value={selectedCourseCode}
              onChange={(e) => { setSelectedCourseCode(e.target.value); setPage(1); }}
              className="text-xs px-2 py-1 rounded bg-transparent text-text-secondary focus:outline-none border-l border-white/[0.06] cursor-pointer"
            >
              <option value="">All Courses</option>
              {initialSubjects.map((s) => (
                <option key={s.id} value={s.course_code}>{s.course_code} - {s.name}</option>
              ))}
            </select>

            <select
              value={selectedStaffId}
              onChange={(e) => { setSelectedStaffId(e.target.value); setPage(1); }}
              className="text-xs px-2 py-1 rounded bg-transparent text-text-secondary focus:outline-none border-l border-white/[0.06] cursor-pointer"
            >
              <option value="">All Staff</option>
              {initialStaff.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.02] px-2 py-1.5 rounded-lg border border-white/[0.06]">
             <span className="text-xs font-semibold text-text-tertiary px-1">Sort:</span>
             {["score", "downloads", "upvotes", "newest"].map((opt) => (
              <button
                key={opt}
                onClick={() => { setSort(opt); setPage(1); }}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer capitalize font-medium",
                  sort === opt
                    ? "bg-accent-primary text-brand-primary font-bold shadow-md"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card flex items-start gap-4 p-5 animate-pulse">
              <div className="w-10 h-10 rounded bg-white/[0.04] border border-white/[0.06] shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 bg-white/[0.04] rounded-full" />
                <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-empty p-12 text-center text-sm text-text-tertiary space-y-4">
          <Search className="h-10 w-10 text-text-tertiary mx-auto opacity-40" />
          <p>No documents found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card flex flex-col sm:flex-row sm:items-start gap-4 p-5 transition-all hover:bg-white/[0.02]">
              {/* Upvote score controls */}
              <div className="glass-vote flex sm:flex-col flex-row items-center justify-center gap-2 p-2 shrink-0 select-none order-2 sm:order-1 self-start sm:self-auto rounded-xl">
                <button
                  onClick={() => handleVote(doc.id, 1)}
                  className={cn(
                    "p-1 hover:text-accent-primary transition-colors cursor-pointer",
                    doc.user_vote === 1 ? "text-accent-primary" : "text-text-tertiary"
                  )}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <span className="text-xs font-bold font-mono">
                  {doc.upvotes_count}
                </span>
                <button
                  onClick={() => handleVote(doc.id, -1)}
                  className={cn(
                    "p-1 hover:text-accent-panic transition-colors cursor-pointer",
                    doc.user_vote === -1 ? "text-accent-panic" : "text-text-tertiary"
                  )}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              {/* Document details */}
              <div className="min-w-0 flex-1 space-y-2 order-1 sm:order-2">
                <div className="flex flex-wrap items-center gap-2">
                  {doc.type === "NOTES" ? (
                     <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary/80 bg-accent-primary/[0.06] px-2 py-0.5 rounded flex items-center gap-1 border border-accent-primary/10">
                       <FileText className="h-3 w-3" /> Notes
                     </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-warning/80 bg-accent-warning/[0.06] px-2 py-0.5 rounded flex items-center gap-1 border border-accent-warning/10">
                       <BookOpen className="h-3 w-3" /> PYQ
                     </span>
                  )}
                  
                  <Link href={`/course/${doc.subject_code}/notes`} className="text-[10px] font-bold font-mono text-text-secondary bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] hover:text-text-primary transition-colors">
                    {doc.subject_code}
                  </Link>
                  <span className="text-xs font-semibold text-text-secondary truncate max-w-[200px]">
                    {doc.subject_name}
                  </span>
                  {doc.staff_name && (
                    <span className="text-xs font-semibold text-text-tertiary border-l border-white/[0.06] pl-2">
                      Prof. {doc.staff_name}
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-base text-text-primary leading-snug">
                  {doc.title}
                </h4>
                {doc.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 pt-1 text-[10px] text-text-tertiary font-medium">
                  <span>Uploaded by {doc.uploader_name}</span>
                  <span>•</span>
                  <span>{doc.downloads_count} downloads</span>
                  <span>•</span>
                  <span>Score: {doc.score}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 order-3 sm:order-3 self-end sm:self-center">
                <button
                  onClick={() => handleDownload(doc.id, doc.file_url)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && (documents.length > 0 || page > 1) && (
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
              disabled={documents.length < LIMIT}
              className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-bold hover:bg-white/[0.05] disabled:opacity-40 transition-all cursor-pointer text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
