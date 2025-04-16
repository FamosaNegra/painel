import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

interface ExtendedToken {
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  cpf: string
  metadata: any
  loginTimestamp?: number
  tokenCustom?: string
}

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      cpf: string
      metadata: any
      loginTimestamp?: number
      tokenCustom?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT extends ExtendedToken {}
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
        })

        if (user && user.cpf && user.role) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            role: user.role,
            metadata: user.metadata || {},
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

        const permission = user.metadata?.permission || ""
        const timestamp = Date.now()
        const apiKey = process.env.API_KEY || ""
        const tokenCustom = Buffer.from(`${permission}.${timestamp}.${apiKey}`).toString("base64")

        token.loginTimestamp = timestamp
        token.tokenCustom = tokenCustom
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.cpf = token.cpf as string
        session.user.metadata = token.metadata || {}
        session.user.loginTimestamp = token.loginTimestamp
        session.user.tokenCustom = token.tokenCustom
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
