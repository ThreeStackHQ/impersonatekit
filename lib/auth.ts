import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db, users, workspaceMembers } from "@impersonatekit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      workspaceId: string;
      role: "owner" | "admin" | "member";
    };
  }

  interface User {
    workspaceId?: string;
    role?: "owner" | "admin" | "member";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    workspaceId: string;
    role: "owner" | "admin" | "member";
  }
}

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const [membership] = await db
          .select()
          .from(workspaceMembers)
          .where(eq(workspaceMembers.userId, user.id))
          .limit(1);

        if (!membership) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: membership.workspaceId,
          role: membership.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string;
        token.workspaceId = user.workspaceId as string;
        token.role = user.role as "owner" | "admin" | "member";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.workspaceId = token.workspaceId;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
