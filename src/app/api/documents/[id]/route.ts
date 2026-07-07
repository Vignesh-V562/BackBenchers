import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const sql = `
      SELECT d.*, 
             u.name as uploader_name, 
             s.name as subject_name, s.course_code as subject_code,
             dept.name as department_name,
             st.name as staff_name,
             (d.upvotes_count * 2 + d.downloads_count) as score
      FROM documents d
      LEFT JOIN users u ON d.uploader_id = u.id
      LEFT JOIN subjects s ON d.subject_id = s.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN staff st ON d.staff_id = st.id
      WHERE d.id = ? AND d.college_id = ?
      LIMIT 1
    `;

    const { results } = await queryScoped(user, sql, [id, user.collegeId]);

    if (results.length === 0) {
      return NextResponse.json({ error: "Document not found or unauthorized access." }, { status: 404 });
    }

    // Get the user's active vote on this document (if any)
    const { results: votes } = await queryScoped(
      user,
      "SELECT value FROM votes WHERE user_id = ? AND document_id = ? LIMIT 1",
      [user.id, id]
    );

    const userVote = votes.length > 0 ? votes[0].value : 0;

    return NextResponse.json({
      ...results[0],
      user_vote: userVote,
    });
  } catch (error: any) {
    console.error("GET Document ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch document details." }, { status: 500 });
  }
}
