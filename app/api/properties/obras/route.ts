import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const properties = await prisma.properties.findMany({
      where: {
        project_status: "under_construction",
      },
      orderBy: {
        title: "asc",
      },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Erro ao buscar propriedades em obras:", error)
    return NextResponse.json(
      { error: "Erro ao buscar propriedades em obras" },
      { status: 500 }
    )
  }
}
