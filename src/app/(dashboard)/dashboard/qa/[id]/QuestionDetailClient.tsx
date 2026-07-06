"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  UserRound,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuestionDetail {
  id: string;
  title: string;
  body: string;
  created_at: string;
  user_id: string;
  author_name: string;
  subject_name: string | null;
  subject_code: string | null;
}

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  upvotes_count: number;
  is_accepted: number;
  created_at: string;
  author_name: string;
  user_vote: number;
}

export default function QuestionDetailClient({
  question,
  initialAnswers,
  user,
}: {
  question: QuestionDetail;
  initialAnswers: any[];
  user: any;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [newAnswerBody, setNewAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerBody.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/qa/questions/${question.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newAnswerBody.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer.");

      // Add locally for instant update
      const newAns: Answer = {
        id: data.id,
        question_id: question.id,
        user_id: user.id,
        body: newAnswerBody.trim(),
        upvotes_count: 0,
        is_accepted: 0,
        created_at: new Date().toISOString(),
        author_name: user.name,
        user_vote: 0,
      };

      setAnswers((prev) => [...prev, newAns]);
      setNewAnswerBody("");
      toast.success("Answer posted.");
    } catch (err: any) {
      toast.error(err.message || "Error posting answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId: string, value: number) => {
    try {
      const res = await fetch(`/api/qa/answers/${answerId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to vote.");

      setAnswers((prev) =>
        prev.map((a) =>
          a.id === answerId
            ? {
                ...a,
                upvotes_count: data.upvotes_count,
                user_vote: data.user_vote,
              }
            : a
        ).sort((x, y) => y.is_accepted - x.is_accepted || y.upvotes_count - x.upvotes_count)
      );

      toast.success(data.user_vote !== 0 ? "Vote recorded." : "Vote removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to vote.");
    }
  };

  const handleAccept = async (answerId: string) => {
    try {
      const res = await fetch(`/api/qa/answers/${answerId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept answer.");

      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          is_accepted: a.id === answerId ? 1 : 0,
        })).sort((x, y) => y.is_accepted - x.is_accepted || y.upvotes_count - x.upvotes_count)
      );

      toast.success("Answer accepted as correct.");
    } catch (err: any) {
      toast.error(err.message || "Failed to accept answer.");
    }
  };

  const isQuestionAuthor = question.user_id === user.id;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Q&A Board
      </button>

      {/* Question Details Card */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {question.subject_code && (
            <span className="text-[10px] font-mono font-bold text-accent-primary bg-semantic-course-badge-bg px-2.5 py-1 rounded border border-accent-primary/20">
              {question.subject_code.toUpperCase()}
            </span>
          )}
          <span className="text-xs text-text-tertiary">
            Asked by {question.author_name}
          </span>
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-text-primary">
          {question.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {question.body}
        </p>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-tertiary">
          <MessageSquare className="h-4 w-4" />
          <span>{answers.length} Answers</span>
        </div>

        {answers.length === 0 ? (
          <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-8 text-center text-xs text-text-tertiary">
            No answers posted yet. Be the first to share a solution!
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((ans) => {
              const isAccepted = ans.is_accepted === 1;

              return (
                <div 
                  key={ans.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border transition-all shadow-card",
                    isAccepted 
                      ? "border-accent-success/30 bg-accent-success/5" 
                      : "border-brand-border bg-brand-surface/50"
                  )}
                >
                  {/* Upvote controls */}
                  <div className="flex flex-col items-center gap-0.5 bg-brand-elevated/40 p-1.5 rounded-lg border border-brand-border shrink-0 select-none">
                    <button
                      onClick={() => handleVote(ans.id, 1)}
                      className={cn(
                        "p-1 hover:text-accent-primary transition-all cursor-pointer",
                        ans.user_vote === 1 ? "text-accent-primary" : "text-text-tertiary"
                      )}
                    >
                      <ChevronUp className="h-4.5 w-4.5" />
                    </button>
                    <span className="text-xs font-bold font-mono">
                      {ans.upvotes_count}
                    </span>
                    <button
                      onClick={() => handleVote(ans.id, -1)}
                      className={cn(
                        "p-1 hover:text-accent-panic transition-all cursor-pointer",
                        ans.user_vote === -1 ? "text-accent-panic" : "text-text-tertiary"
                      )}
                    >
                      <ChevronDown className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Body details */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {ans.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-tertiary font-medium">
                      <span>Answered by {ans.author_name}</span>
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 text-accent-success bg-accent-success/10 px-2 py-0.5 rounded-full font-semibold border border-accent-success/20">
                          <Check className="h-3 w-3" />
                          Accepted Solution
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accept action (only for question author if no answer is accepted, or toggle) */}
                  {isQuestionAuthor && !isAccepted && (
                    <button
                      onClick={() => handleAccept(ans.id)}
                      className="p-2 rounded-lg border border-brand-border bg-brand-elevated/40 hover:bg-accent-success/20 hover:text-accent-success hover:border-accent-success/20 text-text-tertiary transition-all cursor-pointer shrink-0"
                      title="Accept this answer"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Answer Composer */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-card space-y-4">
        <h4 className="font-bold text-sm">Post Your Answer</h4>
        <form onSubmit={handlePostAnswer} className="space-y-4">
          <textarea
            placeholder="Type your explanation, formulas, or solutions here..."
            value={newAnswerBody}
            onChange={(e) => setNewAnswerBody(e.target.value)}
            required
            className="w-full h-32 p-4 rounded-xl bg-brand-elevated border border-brand-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-lg bg-accent-primary text-sm font-bold text-brand-primary hover:bg-accent-primary-hover disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? "Posting solution..." : "Post Solution"}
          </button>
        </form>
      </div>
    </div>
  );
}
