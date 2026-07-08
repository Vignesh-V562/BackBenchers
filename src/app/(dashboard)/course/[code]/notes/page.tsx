import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { queryScoped } from "@/lib/scoped-query";
import NotesClient from "./NotesClient";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const { code } = await params;

  // 1. Fetch subject details
  const { results: subjects } = await queryScoped(
    user,
    "SELECT id, department_id FROM subjects WHERE UPPER(course_code) = UPPER(?) AND college_id = ? LIMIT 1",
    [code, user.collegeId]
  );

  const subject = subjects[0];
  if (!subject) {
    notFound();
  }

  // 2. Fetch staff list for this department
  const { results: staff } = await queryScoped(
    user,
    "SELECT id, name FROM staff WHERE department_id = ? AND college_id = ? ORDER BY name ASC",
    [subject.department_id, user.collegeId]
  );

  return (
    <div className="flex-1 flex flex-col">
      <NotesClient 
        subjectId={subject.id} 
        departmentId={subject.department_id}
        staffList={staff} 
        user={user} 
      />
    </div>
  );
}
