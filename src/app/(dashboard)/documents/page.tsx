import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { queryD1 } from "@/lib/d1";
import DocumentsBrowserClient from "./DocumentsBrowserClient";

export const metadata = {
  title: "Global Search | Backbenchers",
  description: "Search and filter all study materials across your college.",
};

export default async function GlobalDocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // Fetch subjects and staff to populate filter dropdowns
  const [{ results: subjects }, { results: staff }] = await Promise.all([
    queryD1("SELECT id, name, course_code FROM subjects WHERE college_id = ? ORDER BY name ASC", [user.collegeId]),
    queryD1("SELECT id, name, department_id FROM staff WHERE college_id = ? ORDER BY name ASC", [user.collegeId]),
  ]);

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Global Search</h1>
        <p className="text-sm text-text-secondary mt-1">
          Search and filter through all notes, question papers, and study materials in your college.
        </p>
      </div>

      <DocumentsBrowserClient initialSubjects={subjects} initialStaff={staff} />
    </div>
  );
}
