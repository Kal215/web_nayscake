import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createHash } from "node:crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string" || credentials.email.length > 254 || credentials.password.length > 200) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const key = createHash("sha256").update(email).digest("hex");
        const attempts = await prisma.$queryRaw<{ count: number }[]>`
          INSERT INTO "LoginAttempt" ("key", "count", "expiresAt") VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
          ON CONFLICT ("key") DO UPDATE SET
            "count" = CASE WHEN "LoginAttempt"."expiresAt" < NOW() THEN 1 ELSE "LoginAttempt"."count" + 1 END,
            "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" < NOW() THEN NOW() + INTERVAL '15 minutes' ELSE "LoginAttempt"."expiresAt" END
          RETURNING "count"`;
        if (attempts[0].count > 10) return null;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }
        await prisma.loginAttempt.deleteMany({ where: { key } });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt"
  }
});
