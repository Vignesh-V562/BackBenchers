import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { queryD1 } from "@/lib/d1";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Query Cloudflare D1 for the user
        const { results } = await queryD1(
          "SELECT * FROM users WHERE email = ? LIMIT 1",
          [credentials.email.toLowerCase().trim()]
        );

        const user = results[0];

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password_hash) {
          throw new Error("Account has no password configured");
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        // Return user object including roles and college metadata
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          collegeId: user.college_id,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.collegeId = user.collegeId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          collegeId: token.collegeId,
          role: token.role,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export default handler;
