import { DefaultSession, DefaultUser } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

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
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    cpf: string
    role: string
    metadata: any
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
    cpf: string
    metadata: any
    loginTimestamp?: number
    tokenCustom?: string
  }
}
