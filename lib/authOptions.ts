import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { DefaultUser } from "next-auth";

interface UserMetadata {
  permission: string;
  [key: string]: unknown;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        cpf: { label: "CPF", type: "text" },
      },
      async authorize(credentials) {
        const user = await prisma.users.findFirst({
          where: {
            email: credentials?.email,
            cpf: credentials?.cpf,
          },
        });

        if (user && user.cpf && user.role) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            role: user.role,
            metadata: user.metadata || {},
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as DefaultUser & {
          cpf: string;
          role: string;
          metadata: UserMetadata;
        };

        token.role = customUser.role;
        token.cpf = customUser.cpf;
        token.metadata = customUser.metadata ?? {};

        const permission = customUser.metadata?.permission || "";
        const timestamp = Date.now();
        const apiKey = process.env.API_KEY || "";
        const tokenCustom = Buffer.from(
          `${permission}.${timestamp}.${apiKey}`
        ).toString("base64");

        token.loginTimestamp = timestamp;
        token.tokenCustom = tokenCustom;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.cpf = token.cpf;
        session.user.metadata = token.metadata || {};
        session.user.loginTimestamp = token.loginTimestamp;
        session.user.tokenCustom = token.tokenCustom;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
