import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { results } = await queryScoped(
      user,
      "SELECT * FROM departments WHERE college_id = ? ORDER BY name ASC",
      [user.collegeId]
    );

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Departments Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch departments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    const cleanName = name.trim().toUpperCase();

    // Check if department already exists in this college
    const { results: existing } = await queryScoped(
      user,
      "SELECT * FROM departments WHERE college_id = ? AND name = ? LIMIT 1",
      [user.collegeId, cleanName]
    );

    if (existing.length > 0) {
      return NextResponse.json(existing[0]); // Return existing
    }

    const id = crypto.randomUUID();
    await queryScoped(
      user,
      "INSERT INTO departments (id, college_id, name) VALUES (?, ?, ?)",
      [id, user.collegeId, cleanName]
    );

    return NextResponse.json({ id, name: cleanName, college_id: user.collegeId }, { status: 210 });
  } catch (error: any) {
    console.error("POST Department Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create department." }, { status: 500 });
  }
}
