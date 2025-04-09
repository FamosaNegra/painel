import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const properties = await prisma.properties.findMany()
    return NextResponse.json(properties)
  } catch (error) {
    console.error("Erro ao buscar propriedades:", error)
    return NextResponse.json(
      { error: "Erro ao buscar propriedades" },
      { status: 500 }
    )
  }
}
