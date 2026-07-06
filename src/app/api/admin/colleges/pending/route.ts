import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helper";
import { queryD1 } from "@/lib/d1";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied. Super Admin role required." }, { status: 403 });
    }

    const { results } = await queryD1(
      "SELECT * FROM colleges WHERE status = 'PENDING' ORDER BY created_at DESC"
    );

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Pending Colleges Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch pending colleges." }, { status: 500 });
  }
}
