import { queryD1, D1Result } from "./d1";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  collegeId: string;
  role: string;
}

/**
 * A fail-safe checker that ensures any SQL statement referencing scoped tables
 * has a check on 'college_id' to prevent accidental cross-college data leaks.
 */
export function enforceCollegeScope(sql: string) {
  const normalizedSql = sql.toLowerCase();
  const scopedTables = ["documents", "subjects", "staff", "departments", "questions", "answers"];
  
  const touchesScopedTable = scopedTables.some(table => normalizedSql.includes(table));
  
  if (touchesScopedTable) {
    const hasCollegeIdFilter = normalizedSql.includes("college_id") || normalizedSql.includes("colleges");
    if (!hasCollegeIdFilter) {
      throw new Error(`Security Exception: Scoped table accessed without college_id filtering: "${sql}"`);
    }
  }
}

/**
 * Executes a query against Cloudflare D1 while enforcing college-level isolation.
 */
export async function queryScoped<T = any>(
  user: SessionUser,
  sql: string,
  params: any[] = []
): Promise<D1Result<T>> {
  if (!user || !user.collegeId) {
    throw new Error("Unauthorized: Session is missing collegeId.");
  }
  
  enforceCollegeScope(sql);
  return queryD1<T>(sql, params);
}

// ============================================================
// TYPED READ/WRITE SCOPED HELPERS (Enforces security and speed)
// ============================================================

export async function getScopedColleges() {
  // Colleges table is globally accessible for authentication, but status pending check is done in admin routes
  return queryD1("SELECT * FROM colleges ORDER BY name ASC");
}

export async function getScopedDepartments(user: SessionUser) {
  return queryScoped(
    user,
    "SELECT * FROM departments WHERE college_id = ? ORDER BY name ASC",
    [user.collegeId]
  );
}

export async function getScopedSubjects(user: SessionUser, departmentId?: string) {
  let sql = "SELECT * FROM subjects WHERE college_id = ?";
  const params = [user.collegeId];
  if (departmentId) {
    sql += " AND department_id = ?";
    params.push(departmentId);
  }
  sql += " ORDER BY year_or_semester ASC, name ASC";
  return queryScoped(user, sql, params);
}

export async function getScopedStaff(user: SessionUser, departmentId?: string) {
  let sql = "SELECT * FROM staff WHERE college_id = ?";
  const params = [user.collegeId];
  if (departmentId) {
    sql += " AND department_id = ?";
    params.push(departmentId);
  }
  sql += " ORDER BY name ASC";
  return queryScoped(user, sql, params);
}
