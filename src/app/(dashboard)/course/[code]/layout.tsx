import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { queryD1 } from "@/lib/d1";
import NavigationTabs from "./NavigationTabs";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const { code } = await params;

  // Fetch subject details for this course code, isolated to user's collegeId
  const { results: subjects } = await queryD1(
    `SELECT s.*, dept.name as department_name 
     FROM subjects s 
     LEFT JOIN departments dept ON s.department_id = dept.id 
     WHERE UPPER(s.course_code) = UPPER(?) AND s.college_id = ? 
     LIMIT 1`,
    [code, user.collegeId]
  );

  const subject = subjects[0];

  if (!subject) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      {/* Course Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold glass-badge px-2.5 py-1 rounded">
                {subject.course_code.toUpperCase()}
              </span>
              <span className="text-xs text-text-tertiary uppercase tracking-wider font-bold">
                {subject.department_name} Department • Semester {subject.year_or_semester}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mt-2">{subject.name}</h2>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Client Component for active tab coloring) */}
      <NavigationTabs code={code} />

      {/* Main tab view content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
