import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SessionUser } from "./scoped-query";

/**
 * Server-side helper to retrieve the authenticated user session.
 */
export async function getSessionUser(): Promise<SessionUser | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user as SessionUser | undefined;
}
