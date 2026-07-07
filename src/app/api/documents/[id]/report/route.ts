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

    const { id: documentId } = await params;
    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Reason is required to file a report." }, { status: 400 });
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

    // 2. Insert report record
    const reportId = crypto.randomUUID();
    await queryScoped(
      user,
      "INSERT INTO reports (id, reporter_id, document_id, reason, status) VALUES (?, ?, ?, ?, 'PENDING')",
      [reportId, user.id, documentId, reason.trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Report filed successfully. A moderator will review it.",
    });
  } catch (error: any) {
    console.error("POST Report Error:", error);
    return NextResponse.json({ error: error.message || "Failed to file report." }, { status: 500 });
  }
}
