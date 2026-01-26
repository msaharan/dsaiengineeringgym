import "server-only";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/lib/db";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!githubClientId || !githubClientSecret) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
