import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: questionId } = params;

    // Fetch the question
    const { results: questions } = await queryScoped(
      user,
      `SELECT q.*, 
              u.name as author_name, 
              s.name as subject_name, s.course_code as subject_code
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       LEFT JOIN subjects s ON q.subject_id = s.id
       WHERE q.id = ? AND q.college_id = ?
       LIMIT 1`,
      [questionId, user.collegeId]
    );

    if (questions.length === 0) {
      return NextResponse.json({ error: "Question not found or access denied." }, { status: 404 });
    }

    const question = questions[0];

    // Fetch the answers for the question
    const { results: answers } = await queryScoped(
      user,
      `SELECT a.*, 
              u.name as author_name,
              COALESCE(v.value, 0) as user_vote
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN votes v ON v.answer_id = a.id AND v.user_id = ?
       WHERE a.question_id = ?
       ORDER BY a.is_accepted DESC, a.upvotes_count DESC, a.created_at ASC`,
      [user.id, questionId]
    );

    return NextResponse.json({
      ...question,
      answers,
    });
  } catch (error: any) {
    console.error("GET Question ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch question details." }, { status: 500 });
  }
}
