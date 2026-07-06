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

    // 1. Verify document belongs to user's college
    const { results: docs } = await queryScoped(
      user,
      "SELECT id FROM documents WHERE id = ? AND college_id = ? LIMIT 1",
      [documentId, user.collegeId]
    );

    if (docs.length === 0) {
      return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
    }

    // 2. Track download event
    const downloadId = crypto.randomUUID();
    await queryScoped(
      user,
      "INSERT INTO downloads (id, user_id, document_id) VALUES (?, ?, ?)",
      [downloadId, user.id, documentId]
    );

    // 3. Increment downloads count on document
    await queryScoped(
      user,
      "UPDATE documents SET downloads_count = downloads_count + 1 WHERE id = ?",
      [documentId]
    );

    // 4. Return updated document counts
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
    });
  } catch (error: any) {
    console.error("POST Download Tracker Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log download." }, { status: 500 });
  }
}
