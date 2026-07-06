import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { queryD1 } from "@/lib/d1";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function MySubmissionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // Fetch documents uploaded by the active user
  const { results: documents } = await queryD1(
    `SELECT d.*, 
            s.name as subject_name, s.course_code as subject_code
     FROM documents d
     LEFT JOIN subjects s ON d.subject_id = s.id
     WHERE d.uploader_id = ? AND d.college_id = ?
     ORDER BY d.created_at DESC`,
    [user.id, user.collegeId]
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">My Uploaded Resources</h2>
        <p className="text-sm text-text-secondary mt-1">
          Track and manage your shared study notes and question papers.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface/20 p-12 text-center text-sm text-text-secondary max-w-2xl mx-auto space-y-3 mt-10">
          <FileText className="h-10 w-10 text-text-tertiary mx-auto opacity-40" />
          <p className="font-semibold text-text-primary">No submissions yet</p>
          <p className="text-xs text-text-tertiary">
            Study guides, class notes, or exam papers you upload will show up here.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-full bg-accent-primary px-4 text-xs font-bold text-brand-primary hover:bg-accent-primary-hover shadow-lg mt-2"
          >
            Browse subjects to upload
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-xl shadow-card"
            >
              <div className="min-w-0 flex-1 space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-accent-primary bg-semantic-course-badge-bg px-2 py-0.5 rounded border border-accent-primary/20">
                    {doc.subject_code.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-text-tertiary uppercase font-bold">
                    {doc.type}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-text-primary truncate">{doc.title}</h4>
                <p className="text-xs text-text-tertiary">
                  Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Status Badge & details */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold font-mono text-text-primary">{doc.downloads_count} downloads</p>
                  <p className="text-[10px] text-text-tertiary">{doc.upvotes_count} upvotes</p>
                </div>

                <Link
                  href={`/documents/${doc.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-brand-border bg-brand-elevated hover:bg-brand-card hover:border-brand-border-strong px-4 text-xs font-bold transition-all cursor-pointer"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
