"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Filter, FileText, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LeaderboardDoc {
  id: string;
  title: string;
  type: string;
  downloads_count: number;
  upvotes_count: number;
  score: number;
  uploader_name: string;
  subject_name: string;
  subject_code: string;
}

export default function LeaderboardClient({
  initialSubjects,
}: {
  initialSubjects: any[];
}) {
  const [documents, setDocuments] = useState<LeaderboardDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let url = "/api/leaderboard";
      if (selectedSubjectId) url += `?subjectId=${selectedSubjectId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch leaderboard.");
      setDocuments(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjectId]);

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="glass-toolbar flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-tertiary" />
          <span className="text-xs font-semibold text-text-secondary">Filter by Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg glass-form-control"
          >
            <option value="">All Subjects (Global)</option>
            {initialSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.course_code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="glass-card h-20 animate-pulse bg-white/[0.02]" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-empty p-12 text-center text-sm text-text-tertiary">
          <Trophy className="h-12 w-12 text-text-tertiary mx-auto opacity-40 mb-4" />
          <p>No documents found to rank.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => {
            const rank = index + 1;
            let RankIcon = null;
            let rankColor = "text-text-tertiary";
            let cardStyle = "bg-white/[0.01]";

            if (rank === 1) {
              RankIcon = Trophy;
              rankColor = "text-yellow-400";
              cardStyle = "bg-gradient-to-r from-yellow-400/10 to-transparent border-yellow-400/20";
            } else if (rank === 2) {
              RankIcon = Medal;
              rankColor = "text-gray-300";
              cardStyle = "bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/20";
            } else if (rank === 3) {
              RankIcon = Medal;
              rankColor = "text-amber-600";
              cardStyle = "bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/20";
            }

            return (
              <div 
                key={doc.id} 
                className={cn(
                  "glass-card flex items-center p-4 gap-4 transition-all hover:bg-white/[0.04]",
                  cardStyle
                )}
              >
                {/* Rank Badge */}
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                  {RankIcon ? (
                    <RankIcon className={cn("h-7 w-7 mb-1", rankColor)} />
                  ) : (
                    <div className="h-7 w-7 flex items-center justify-center rounded-full bg-white/[0.04] text-text-secondary font-bold font-mono text-sm mb-1">
                      {rank}
                    </div>
                  )}
                </div>

                {/* Document Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {doc.type === "NOTES" ? (
                       <FileText className="h-3.5 w-3.5 text-accent-primary" />
                    ) : (
                       <BookOpen className="h-3.5 w-3.5 text-accent-warning" />
                    )}
                    <h4 className="font-bold text-base text-text-primary truncate">
                      {doc.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <Link href={`/course/${doc.subject_code}/notes`} className="font-mono font-bold bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] hover:text-text-primary">
                      {doc.subject_code}
                    </Link>
                    <span className="truncate">{doc.subject_name}</span>
                    <span className="text-text-tertiary border-l border-white/[0.06] pl-3">
                      by {doc.uploader_name}
                    </span>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="flex items-center gap-6 shrink-0 pl-4 border-l border-white/[0.06]">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Upvotes</span>
                    <span className="font-mono font-bold text-sm text-text-secondary">{doc.upvotes_count}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Downloads</span>
                    <span className="font-mono font-bold text-sm text-text-secondary">{doc.downloads_count}</span>
                  </div>
                  <div className="flex flex-col items-end bg-accent-primary/[0.08] px-3 py-1.5 rounded-lg border border-accent-primary/20">
                    <span className="text-[10px] text-accent-primary font-bold uppercase tracking-wider">Total Score</span>
                    <span className="font-mono font-extrabold text-base text-brand-primary">{doc.score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
