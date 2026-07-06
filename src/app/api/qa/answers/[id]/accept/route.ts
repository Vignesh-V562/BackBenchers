import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: answerId } = params;

    // 1. Fetch the question details related to this answer
    const { results: qDetails } = await queryScoped(
      user,
      `SELECT q.id as question_id, q.user_id as question_author_id, q.college_id 
       FROM answers a 
       JOIN questions q ON a.question_id = q.id 
       WHERE a.id = ? AND q.college_id = ? 
       LIMIT 1`,
      [answerId, user.collegeId]
    );

    if (qDetails.length === 0) {
      return NextResponse.json({ error: "Answer not found or access denied." }, { status: 404 });
    }

    const { question_id, question_author_id } = qDetails[0];

    // 2. Verify that the current user is the author of the question
    if (question_author_id !== user.id) {
      return NextResponse.json(
        { error: "Only the author of the question can accept answers." },
        { status: 403 }
      );
    }

    // 3. Un-accept all answers for this question
    await queryScoped(
      user,
      "UPDATE answers SET is_accepted = 0 WHERE question_id = ?",
      [question_id]
    );

    // 4. Mark this specific answer as accepted
    await queryScoped(
      user,
      "UPDATE answers SET is_accepted = 1 WHERE id = ?",
      [answerId]
    );

    return NextResponse.json({
      success: true,
      message: "Answer accepted successfully.",
    });
  } catch (error: any) {
    console.error("POST Accept Answer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to accept answer." }, { status: 500 });
  }
}
