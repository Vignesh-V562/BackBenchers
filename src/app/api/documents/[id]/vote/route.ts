import { NextResponse } from "next/server";
import crypto from "crypto";
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

    const { id: documentId } = params;
    const { value } = await request.json(); // 1 for upvote, -1 for downvote

    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: "Vote value must be 1 or -1." }, { status: 400 });
    }

    // 1. Verify document belongs to user's college
    const { results: docs } = await queryScoped(
      user,
      "SELECT id FROM documents WHERE id = ? AND college_id = ? LIMIT 1",
      [documentId, user.collegeId]
    );

    if (docs.length === 0) {
      return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
    }

    // 2. Fetch existing vote
    const { results: existingVotes } = await queryScoped(
      user,
      "SELECT id, value FROM votes WHERE user_id = ? AND document_id = ? LIMIT 1",
      [user.id, documentId]
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
        "INSERT INTO votes (id, user_id, document_id, value) VALUES (?, ?, ?, ?)",
        [voteId, user.id, documentId, value]
      );
      newUserVote = value;
    }

    // 3. Recalculate and update the document's upvotes_count
    // We store the sum of votes (net score) in upvotes_count
    await queryScoped(
      user,
      `UPDATE documents 
       SET upvotes_count = (
         SELECT COALESCE(SUM(value), 0) 
         FROM votes 
         WHERE document_id = ?
       ) 
       WHERE id = ?`,
      [documentId, documentId]
    );

    // Fetch the updated document details
    const { results: updatedDocs } = await queryScoped(
      user,
      "SELECT upvotes_count, downloads_count FROM documents WHERE id = ? LIMIT 1",
      [documentId]
    );

    const doc = updatedDocs[0];
    const score = (doc.upvotes_count * 2) + doc.downloads_count;

    return NextResponse.json({
      success: true,
      upvotes_count: doc.upvotes_count,
      downloads_count: doc.downloads_count,
      score,
      user_vote: newUserVote,
    });
  } catch (error: any) {
    console.error("POST Vote Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit vote." }, { status: 500 });
  }
}
