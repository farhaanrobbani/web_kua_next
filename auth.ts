import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { isRole } from "@/lib/roles";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: "/yukmasuk",
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Email dan Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse({
          email: String(raw?.email ?? "").trim().toLowerCase(),
          password: String(raw?.password ?? ""),
        });

        if (!parsed.success) return null;

        const user = await prisma.users.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.is_active || !isRole(user.role)) return null;

        const valid = await compare(parsed.data.password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id ?? token.sub ?? "");
      session.user.role = isRole(token.role) ? token.role : "staff";
      session.user.isActive = token.isActive === true;
      return session;
    },
  },
});
