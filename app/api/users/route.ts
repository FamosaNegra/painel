import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try {
    const users = await prisma.users.findMany({
      where: { role: "customer" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error) // <- AQUI!
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    )
  }
}
