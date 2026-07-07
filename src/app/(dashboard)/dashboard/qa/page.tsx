import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { queryD1 } from "@/lib/d1";
import QaBoardClient from "./QaBoardClient";

export default async function QaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // 1. Fetch questions scoped by collegeId
  const { results: questions } = await queryD1(
    `SELECT q.*, 
            u.name as author_name, 
            s.name as subject_name, s.course_code as subject_code,
            (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) as answers_count
     FROM questions q
     LEFT JOIN users u ON q.user_id = u.id
     LEFT JOIN subjects s ON q.subject_id = s.id
     WHERE q.college_id = ?
     ORDER BY q.created_at DESC`,
    [user.collegeId]
  );

  // 2. Fetch subject list for question tagging
  const { results: subjects } = await queryD1(
    "SELECT id, name, course_code FROM subjects WHERE college_id = ? ORDER BY name ASC",
    [user.collegeId]
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Q&A Study Board</h2>
        <p className="text-sm text-text-secondary mt-1">
          Ask academic questions and share solutions with students from your college.
        </p>
      </div>

      <QaBoardClient 
        initialQuestions={questions} 
        subjects={subjects} 
        user={user} 
      />
    </div>
  );
}
