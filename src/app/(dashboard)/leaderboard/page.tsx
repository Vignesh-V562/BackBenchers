import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { queryD1 } from "@/lib/d1";
import LeaderboardClient from "./LeaderboardClient";

export const metadata = {
  title: "Top Materials | Backbenchers",
  description: "Leaderboard of the most helpful study materials.",
};

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // Fetch subjects to populate the filter dropdown
  const { results: subjects } = await queryD1(
    "SELECT id, name, course_code FROM subjects WHERE college_id = ? ORDER BY name ASC", 
    [user.collegeId]
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent inline-block">
          Top Materials Leaderboard
        </h1>
        <p className="text-sm text-text-secondary max-w-xl mx-auto">
          Discover the highest quality notes and question papers across your college, ranked by upvotes and downloads.
        </p>
      </div>

      <LeaderboardClient initialSubjects={subjects} />
    </div>
  );
}
