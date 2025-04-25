import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.properties.findUnique({
      where: { id: params.id },
    })

    if (!property) {
      return NextResponse.json(
        { error: "Empreendimento não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Erro ao buscar empreendimento:", error)
    return NextResponse.json(
      { error: "Erro ao buscar empreendimento" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { project_evolution } = body

    const updated = await prisma.properties.update({
      where: { id: params.id },
      data: {
        project_evolution,
        updated_at: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao atualizar empreendimento:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar empreendimento" },
      { status: 500 }
    )
  }
}
