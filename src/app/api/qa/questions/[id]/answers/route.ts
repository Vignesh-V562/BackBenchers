import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: questionId } = await params;
    const { body } = await request.json();

    if (!body || !body.trim()) {
      return NextResponse.json({ error: "Answer body is required." }, { status: 400 });
    }

    // 1. Verify question belongs to user's college
    const { results: questions } = await queryScoped(
      user,
      "SELECT id FROM questions WHERE id = ? AND college_id = ? LIMIT 1",
      [questionId, user.collegeId]
    );

    if (questions.length === 0) {
      return NextResponse.json({ error: "Question not found or access denied." }, { status: 404 });
    }

    // 2. Insert answer
    const answerId = crypto.randomUUID();
    await queryScoped(
      user,
      "INSERT INTO answers (id, question_id, user_id, body, upvotes_count, is_accepted) VALUES (?, ?, ?, ?, 0, 0)",
      [answerId, questionId, user.id, body.trim()]
    );

    return NextResponse.json({
      success: true,
      id: answerId,
      message: "Answer posted successfully.",
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Answer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to post answer." }, { status: 500 });
  }
}
