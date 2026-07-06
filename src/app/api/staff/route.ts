import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth-helper";
import { queryScoped } from "@/lib/scoped-query";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    let sql = "SELECT * FROM staff WHERE college_id = ?";
    const params: any[] = [user.collegeId];

    if (departmentId) {
      sql += " AND department_id = ?";
      params.push(departmentId);
    }

    sql += " ORDER BY name ASC";

    const { results } = await queryScoped(user, sql, params);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Staff Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch staff." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, departmentId } = await request.json();

    if (!name || !departmentId) {
      return NextResponse.json({ error: "Missing required fields (name, departmentId)" }, { status: 400 });
    }

    // Verify department belongs to the user's college
    const { results: depts } = await queryScoped(
      user,
      "SELECT id FROM departments WHERE id = ? AND college_id = ? LIMIT 1",
      [departmentId, user.collegeId]
    );

    if (depts.length === 0) {
      return NextResponse.json({ error: "Department not found in your college." }, { status: 404 });
    }

    const cleanName = name.trim();

    // Check if staff already exists in this department
    const { results: existing } = await queryScoped(
      user,
      "SELECT * FROM staff WHERE college_id = ? AND department_id = ? AND name = ? LIMIT 1",
      [user.collegeId, departmentId, cleanName]
    );

    if (existing.length > 0) {
      return NextResponse.json(existing[0]); // Return existing
    }

    const id = crypto.randomUUID();
    await queryScoped(
      user,
      "INSERT INTO staff (id, college_id, department_id, name) VALUES (?, ?, ?, ?)",
      [id, user.collegeId, departmentId, cleanName]
    );

    return NextResponse.json({
      id,
      name: cleanName,
      college_id: user.collegeId,
      department_id: departmentId,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Staff Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create staff." }, { status: 500 });
  }
}
