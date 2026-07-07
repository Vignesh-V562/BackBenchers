import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { queryD1 } from "@/lib/d1";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied. Super Admin role required." }, { status: 403 });
    }

    const { id: collegeId } = await params;
    const { action } = await request.json(); // "verify" or "suspend"

    let status = "VERIFIED";
    if (action === "suspend") {
      status = "SUSPENDED";
    }

    await queryD1(
      "UPDATE colleges SET status = ? WHERE id = ?",
      [status, collegeId]
    );

    return NextResponse.json({
      success: true,
      message: `College status updated to ${status}.`,
    });
  } catch (error: any) {
    console.error("POST Verify College Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update college status." }, { status: 500 });
  }
}
