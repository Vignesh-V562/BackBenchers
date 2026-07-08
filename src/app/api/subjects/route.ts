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
    const yearOrSemester = searchParams.get("yearOrSemester");

    let sql = "SELECT * FROM subjects WHERE college_id = ?";
    const params: any[] = [user.collegeId];

    if (departmentId) {
      sql += " AND department_id = ?";
      params.push(departmentId);
    }
    if (yearOrSemester) {
      sql += " AND year_or_semester = ?";
      params.push(parseInt(yearOrSemester, 10));
    }

    sql += " ORDER BY year_or_semester ASC, name ASC";

    const { results } = await queryScoped(user, sql, params);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Subjects Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch subjects." }, { status: 500 });
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

    const { name, courseCode, yearOrSemester, departmentId } = await request.json();

    if (!name || !courseCode || !yearOrSemester || !departmentId) {
      return NextResponse.json({ error: "Missing required fields (name, courseCode, yearOrSemester, departmentId)" }, { status: 400 });
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

    const cleanCode = courseCode.trim().toUpperCase();

    // Check if subject courseCode already exists in this college
    const { results: existing } = await queryScoped(
      user,
      "SELECT * FROM subjects WHERE college_id = ? AND course_code = ? LIMIT 1",
      [user.collegeId, cleanCode]
    );

    if (existing.length > 0) {
      return NextResponse.json(existing[0]); // Return existing
    }

    const id = crypto.randomUUID();
    await queryScoped(
      user,
      `INSERT INTO subjects (id, college_id, department_id, name, course_code, year_or_semester)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.collegeId, departmentId, name.trim(), cleanCode, parseInt(yearOrSemester, 10)]
    );

    return NextResponse.json({
      id,
      name: name.trim(),
      course_code: cleanCode,
      college_id: user.collegeId,
      department_id: departmentId,
      year_or_semester: parseInt(yearOrSemester, 10),
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Subject Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create subject." }, { status: 500 });
  }
}
