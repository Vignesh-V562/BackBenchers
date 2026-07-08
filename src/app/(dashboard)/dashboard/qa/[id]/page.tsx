import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { queryScoped } from "@/lib/scoped-query";
import QuestionDetailClient from "./QuestionDetailClient";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  const { id: questionId } = await params;

  // 1. Fetch the question details
  const { results: questions } = await queryScoped(
    user,
    `SELECT q.*, 
            u.name as author_name, 
            s.name as subject_name, s.course_code as subject_code
     FROM questions q
     LEFT JOIN users u ON q.user_id = u.id
     LEFT JOIN subjects s ON q.subject_id = s.id
     WHERE q.id = ? AND q.college_id = ?
     LIMIT 1`,
    [questionId, user.collegeId]
  );

  const question = questions[0];

  if (!question) {
    notFound();
  }

  // 2. Fetch the answers
  const { results: answers } = await queryScoped(
    user,
    `SELECT a.*, 
            u.name as author_name,
            COALESCE(v.value, 0) as user_vote
     FROM answers a
     LEFT JOIN users u ON a.user_id = u.id
     LEFT JOIN votes v ON v.answer_id = a.id AND v.user_id = ?
     INNER JOIN questions q ON a.question_id = q.id
     WHERE a.question_id = ? AND q.college_id = ?
     ORDER BY a.is_accepted DESC, a.upvotes_count DESC, a.created_at ASC`,
    [user.id, questionId, user.collegeId]
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <QuestionDetailClient 
        question={question} 
        initialAnswers={answers} 
        user={user} 
      />
    </div>
  );
}
