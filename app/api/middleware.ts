import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_PERMISSIONS = [
  "cac",
  "cac senior",
  "marketing",
  "cac analyst",
  "designer",
  "admin",
]

export function middleware(request: NextRequest) {
  // Roda somente para rotas que comecem com /api
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 })
  }

  try {
    const token = authHeader.replace("Bearer ", "")
    const decoded = atob(token) // formato esperado: permission.timestamp.apiKey
    const [permission, timestamp, key] = decoded.split(".")

    if (
      !permission ||
      !timestamp ||
      !key ||
      !ALLOWED_PERMISSIONS.includes(permission) ||
      isNaN(Number(timestamp)) ||
      key !== process.env.API_KEY
    ) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    return NextResponse.next()
  } catch (err) {
    return NextResponse.json({ error: "Token malformado" }, { status: 401 })
  }
}
