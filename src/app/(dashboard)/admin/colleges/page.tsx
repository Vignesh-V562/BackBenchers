import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { queryD1 } from "@/lib/d1";
import CollegesAdminClient from "./CollegesAdminClient";

export default async function AdminCollegesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-accent-panic">
        Access Denied. Only Platform Super Admins can verify colleges.
      </div>
    );
  }

  // Fetch pending colleges
  const { results: pendingColleges } = await queryD1(
    "SELECT * FROM colleges WHERE status = 'PENDING' ORDER BY created_at DESC"
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl w-full mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Super Admin Hub</h2>
        <p className="text-sm text-text-secondary mt-1">
          Review and verify new college onboarding domain requests.
        </p>
      </div>

      <CollegesAdminClient initialColleges={pendingColleges} />
    </div>
  );
}
