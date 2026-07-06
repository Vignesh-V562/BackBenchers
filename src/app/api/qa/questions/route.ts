import { NextResponse } from "next/server";
import crypto from "crypto";
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
      SELECT q.*, 
             u.name as author_name, 
             s.name as subject_name, s.course_code as subject_code,
             (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answers_count
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN subjects s ON q.subject_id = s.id
      WHERE q.college_id = ?
    `;
    const params: any[] = [user.collegeId];

    if (subjectId) {
      sql += " AND q.subject_id = ?";
      params.push(subjectId);
    }

    sql += " ORDER BY q.created_at DESC";

    const { results } = await queryScoped(user, sql, params);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Questions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch questions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, subjectId } = await request.json();

    if (!title || !title.trim() || !body || !body.trim()) {
      return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    }

    if (subjectId) {
      // Verify subject is in user's college
      const { results: subjs } = await queryScoped(
        user,
        "SELECT id FROM subjects WHERE id = ? AND college_id = ? LIMIT 1",
        [subjectId, user.collegeId]
      );
      if (subjs.length === 0) {
        return NextResponse.json({ error: "Invalid subject selected." }, { status: 400 });
      }
    }

    const id = crypto.randomUUID();
    const cleanSubj = subjectId || null;

    await queryScoped(
      user,
      "INSERT INTO questions (id, college_id, user_id, subject_id, title, body) VALUES (?, ?, ?, ?, ?, ?)",
      [id, user.collegeId, user.id, cleanSubj, title.trim(), body.trim()]
    );

    return NextResponse.json({
      success: true,
      id,
      title,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Question Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create question." }, { status: 500 });
  }
}
