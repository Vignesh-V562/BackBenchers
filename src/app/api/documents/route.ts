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
    const subjectId = searchParams.get("subjectId");
    const staffId = searchParams.get("staffId");
    const departmentId = searchParams.get("departmentId");
    const year = searchParams.get("year");
    const type = searchParams.get("type");
    const examCategory = searchParams.get("examCategory");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "score";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    let sql = `
      SELECT d.*, 
             u.name as uploader_name, 
             s.name as subject_name, s.course_code as subject_code,
             dept.name as department_name,
             st.name as staff_name,
             (d.upvotes_count * 2 + d.downloads_count) as score
      FROM documents d
      LEFT JOIN users u ON d.uploader_id = u.id
      LEFT JOIN subjects s ON d.subject_id = s.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN staff st ON d.staff_id = st.id
      WHERE d.college_id = ?
    `;
    const params: any[] = [user.collegeId];

    if (subjectId) {
      sql += " AND d.subject_id = ?";
      params.push(subjectId);
    }
    if (staffId) {
      sql += " AND d.staff_id = ?";
      params.push(staffId);
    }
    if (departmentId) {
      sql += " AND d.department_id = ?";
      params.push(departmentId);
    }
    if (year) {
      sql += " AND d.year = ?";
      params.push(parseInt(year, 10));
    }
    if (type) {
      sql += " AND d.type = ?";
      params.push(type);
    }
    if (examCategory) {
      sql += " AND d.exam_category = ?";
      params.push(examCategory);
    }
    if (search) {
      const term = `%${search.toLowerCase().trim()}%`;
      sql += " AND (LOWER(d.title) LIKE ? OR LOWER(s.name) LIKE ? OR LOWER(st.name) LIKE ? OR LOWER(s.course_code) LIKE ?)";
      params.push(term, term, term, term);
    }

    if (sort === "newest") {
      sql += " ORDER BY d.created_at DESC";
    } else {
      sql += " ORDER BY score DESC, d.created_at DESC";
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results } = await queryScoped(user, sql, params);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET Documents Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch documents." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      subjectId,
      staffId,
      type,
      examCategory,
      title,
      description,
      fileUrl,
      fileType,
      departmentId,
      year,
    } = body;

    if (!subjectId || !type || !title || !fileUrl || !fileType || !departmentId || !year) {
      return NextResponse.json(
        { error: "Missing required fields (subjectId, type, title, fileUrl, fileType, departmentId, year)." },
        { status: 400 }
      );
    }

    // Safety checks: verify subject and department belong to this college
    const { results: subjs } = await queryScoped(
      user,
      "SELECT id FROM subjects WHERE id = ? AND college_id = ? LIMIT 1",
      [subjectId, user.collegeId]
    );
    if (subjs.length === 0) {
      return NextResponse.json({ error: "Invalid subject selection." }, { status: 400 });
    }

    const { results: depts } = await queryScoped(
      user,
      "SELECT id FROM departments WHERE id = ? AND college_id = ? LIMIT 1",
      [departmentId, user.collegeId]
    );
    if (depts.length === 0) {
      return NextResponse.json({ error: "Invalid department selection." }, { status: 400 });
    }

    if (staffId) {
      const { results: stf } = await queryScoped(
        user,
        "SELECT id FROM staff WHERE id = ? AND college_id = ? LIMIT 1",
        [staffId, user.collegeId]
      );
      if (stf.length === 0) {
        return NextResponse.json({ error: "Invalid staff selection." }, { status: 400 });
      }
    }

    const id = crypto.randomUUID();
    const cleanStaffId = staffId || null;
    const cleanExamCat = type === "QUESTION_PAPER" ? (examCategory || null) : null;
    const cleanDesc = description || null;

    await queryScoped(
      user,
      `INSERT INTO documents (
        id, college_id, uploader_id, subject_id, staff_id, type, 
        exam_category, title, description, file_url, file_type, 
        department_id, year
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user.collegeId,
        user.id,
        subjectId,
        cleanStaffId,
        type,
        cleanExamCat,
        title.trim(),
        cleanDesc,
        fileUrl,
        fileType,
        departmentId,
        parseInt(year, 10),
      ]
    );

    return NextResponse.json({
      success: true,
      id,
      title,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Document Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload document." }, { status: 500 });
  }
}
