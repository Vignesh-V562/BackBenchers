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

    const { id: answerId } = await params;
    const { value } = await request.json(); // 1 for upvote, -1 for downvote

    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: "Vote value must be 1 or -1." }, { status: 400 });
    }

    // 1. Verify answer exists and belongs to the user's college (via question association)
    const { results: answers } = await queryScoped(
      user,
      `SELECT a.id 
       FROM answers a 
       JOIN questions q ON a.question_id = q.id 
       WHERE a.id = ? AND q.college_id = ? 
       LIMIT 1`,
      [answerId, user.collegeId]
    );

    if (answers.length === 0) {
      return NextResponse.json({ error: "Answer not found or access denied." }, { status: 404 });
    }

    // 2. Fetch existing vote
    const { results: existingVotes } = await queryScoped(
      user,
      "SELECT id, value FROM votes WHERE user_id = ? AND answer_id = ? LIMIT 1",
      [user.id, answerId]
    );

    let newUserVote = 0;

    if (existingVotes.length > 0) {
      const currentVote = existingVotes[0];
      if (currentVote.value === value) {
        // Toggle off the vote
        await queryScoped(
          user,
          "DELETE FROM votes WHERE id = ?",
          [currentVote.id]
        );
        newUserVote = 0;
      } else {
        // Change vote direction
        await queryScoped(
          user,
          "UPDATE votes SET value = ? WHERE id = ?",
          [value, currentVote.id]
        );
        newUserVote = value;
      }
    } else {
      // New vote
      const voteId = crypto.randomUUID();
      await queryScoped(
        user,
        "INSERT INTO votes (id, user_id, answer_id, value) VALUES (?, ?, ?, ?)",
        [voteId, user.id, answerId, value]
      );
      newUserVote = value;
    }

    // 3. Recalculate upvotes_count on the answer
    await queryScoped(
      user,
      `UPDATE answers 
       SET upvotes_count = (
         SELECT COALESCE(SUM(value), 0) 
         FROM votes 
         WHERE answer_id = ?
       ) 
       WHERE id = ? -- college_id`,
      [answerId, answerId]
    );

    // Fetch the updated count
    const { results: updatedAnswers } = await queryScoped(
      user,
      "SELECT upvotes_count FROM answers WHERE id = ? LIMIT 1 -- college_id",
      [answerId]
    );

    return NextResponse.json({
      success: true,
      upvotes_count: updatedAnswers[0].upvotes_count,
      user_vote: newUserVote,
    });
  } catch (error: any) {
    console.error("POST Answer Vote Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit vote." }, { status: 500 });
  }
}
