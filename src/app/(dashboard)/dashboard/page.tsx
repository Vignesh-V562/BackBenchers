import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { queryD1 } from "@/lib/d1";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // 1. Fetch departments of the user's college
  const { results: departments } = await queryD1(
    "SELECT * FROM departments WHERE college_id = ? ORDER BY name ASC",
    [user.collegeId]
  );

  // 2. Fetch subjects of the user's college
  const { results: subjects } = await queryD1(
    `SELECT s.*, dept.name as department_name 
     FROM subjects s 
     LEFT JOIN departments dept ON s.department_id = dept.id 
     WHERE s.college_id = ? 
     ORDER BY s.year_or_semester ASC, s.name ASC`,
    [user.collegeId]
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Explore Course Materials</h2>
        <p className="text-sm text-text-secondary mt-1">
          Search subject codes or select departments from the course tree below.
        </p>
      </div>

      <DashboardClient 
        initialDepartments={departments} 
        initialSubjects={subjects} 
        user={user}
      />
    </div>
  );
}
