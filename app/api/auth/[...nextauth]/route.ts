import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

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
        })

        if (user && user.cpf && user.role) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            role: user.role,
            metadata: user.metadata || {}, // garante que metadata nunca será undefined
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.cpf = user.cpf
        token.metadata = user.metadata || {}
        token.loginTimestamp = Date.now() 
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.cpf = token.cpf as string
        session.user.metadata = token.metadata || {}
        session.user.loginTimestamp = token.loginTimestamp
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
