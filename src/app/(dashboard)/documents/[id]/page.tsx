import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { queryScoped } from "@/lib/scoped-query";
import DocumentDetailClient from "./DocumentDetailClient";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const { id } = await params;

  // Query database for the document, checking college isolation
  const { results: documents } = await queryScoped(
    user,
    `SELECT d.*, 
            u.name as uploader_name, 
            s.name as subject_name, s.course_code as subject_code,
            (d.upvotes_count * 2 + d.downloads_count) as score
     FROM documents d
     LEFT JOIN users u ON d.uploader_id = u.id
     LEFT JOIN subjects s ON d.subject_id = s.id
     WHERE d.id = ? AND d.college_id = ?
     LIMIT 1`,
    [id, user.collegeId]
  );

  const doc = documents[0];

  if (!doc) {
    notFound();
  }

  // Fetch the user's vote on this document
  const { results: votes } = await queryScoped(
    user,
    "SELECT value FROM votes WHERE user_id = ? AND document_id = ? LIMIT 1",
    [user.id, id]
  );
  
  const userVote = votes[0]?.value || 0;

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <DocumentDetailClient doc={doc} initialUserVote={userVote} user={user} />
    </div>
  );
}
