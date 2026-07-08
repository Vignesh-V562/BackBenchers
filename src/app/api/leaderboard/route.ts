import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    
    let sql = `
      SELECT d.id, d.title, d.type, d.downloads_count, d.upvotes_count,
             (d.upvotes_count * 2 + d.downloads_count) as score,
             u.name as uploader_name,
             s.name as subject_name,
             s.course_code as subject_code
      FROM documents d
      LEFT JOIN users u ON d.uploader_id = u.id
      LEFT JOIN subjects s ON d.subject_id = s.id
      WHERE d.college_id = ?
    `;
    const params: any[] = [user.collegeId];

    if (subjectId) {
      sql += " AND d.subject_id = ?";
      params.push(subjectId);
    }

    // Sort strictly by score (high upvotes + downloads), limit top 20
    sql += " ORDER BY score DESC, d.created_at DESC LIMIT 20";

    const { results } = await queryScoped(user, sql, params);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Leaderboard Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch leaderboard." }, { status: 500 });
  }
}
