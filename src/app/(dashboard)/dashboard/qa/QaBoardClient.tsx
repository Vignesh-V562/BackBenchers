"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  X,
  Search
} from "lucide-react";
import { toast } from "sonner";


interface Question {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author_name: string;
  subject_name: string | null;
  subject_code: string | null;
  answers_count: number;
}

export default function QaBoardClient({
  initialQuestions,
  subjects,
  user,
}: {
  initialQuestions: any[];
  subjects: any[];
  user: any;
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ask Question Form States
  const [askOpen, setAskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/qa/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          body: newBody.trim(),
          subjectId: newSubjectId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post question.");

      setAskOpen(false);
      setNewTitle("");
      setNewBody("");
      setNewSubjectId("");
      
      const newQ: Question = {
        id: data.id,
        title: newTitle.trim(),
        body: newBody.trim(),
        created_at: new Date().toISOString(),
        author_name: user.name,
        subject_name: subjects.find((s) => s.id === newSubjectId)?.name || null,
        subject_code: subjects.find((s) => s.id === newSubjectId)?.course_code || null,
        answers_count: 0,
      };
      setQuestions((prev) => [newQ, ...prev]);

      toast.success("Question posted on study board.");
    } catch (err: any) {
      toast.error(err.message || "Error posting question.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase().trim();
    return questions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subject_code && item.subject_code.toLowerCase().includes(q))
    );
  }, [searchQuery, questions]);

  return (
    <div className="space-y-6">
      {/* Search & Ask panel */}
      <div className="glass-toolbar flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search questions by topic or subject code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg glass-form-control text-xs"
          />
        </div>

        <button
          onClick={() => setAskOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-primary px-4 text-xs font-bold text-brand-primary hover:bg-accent-primary-hover shadow-lg hover:shadow-accent-primary/20 cursor-pointer transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Ask Question
        </button>
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="glass-empty p-12 text-center text-sm text-text-tertiary space-y-4">
          <HelpCircle className="h-10 w-10 text-text-tertiary mx-auto opacity-40 animate-pulse" />
          <p>No questions found on the board. Start a discussion!</p>
          <button
            onClick={() => setAskOpen(true)}
            className="text-xs text-accent-primary hover:underline font-bold"
          >
            Ask the first study question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <Link
              key={q.id}
              href={`/dashboard/qa/${q.id}`}
              className="glass-card-interactive block p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {q.subject_code && (
                      <span className="text-[10px] font-mono font-bold glass-badge px-2 py-0.5 rounded">
                        {q.subject_code.toUpperCase()}
                      </span>
                    )}
                    <span className="text-[10px] text-text-tertiary">
                      Posted by {q.author_name}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-text-primary leading-snug truncate">
                    {q.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {q.body}
                  </p>
                </div>

                {/* Answers Count Badge */}
                <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-lg text-text-secondary font-bold text-xs shrink-0 select-none backdrop-blur-sm">
                  <MessageSquare className="h-4 w-4 text-text-tertiary" />
                  <span>{q.answers_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Ask Question Dialog */}
      {askOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-overlay">
          <div className="w-full max-w-lg glass-modal p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-bold text-base">Ask a Study Question</h3>
              <button onClick={() => setAskOpen(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAsk} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. How is TCP sliding window sizing computed?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-lg glass-form-control text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Topic Tag (Subject)</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg glass-form-control text-sm"
                >
                  <option value="">No specific subject tag</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.course_code.toUpperCase()}] {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Description / Details</label>
                <textarea
                  placeholder="Provide all context, code snippets, or formulas for your study query..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                  className="w-full h-32 p-3 rounded-lg glass-form-control text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all"
              >
                {submitting ? "Posting question..." : "Post Question"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
