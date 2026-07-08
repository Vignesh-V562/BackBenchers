import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session && session.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
