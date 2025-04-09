import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      cpf: string
      role: string
      metadata: any
    }
  }

  interface User extends DefaultUser {
    cpf: string
    role: string
    metadata: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    cpf: string
    role: string
    metadata: any
  }
}
