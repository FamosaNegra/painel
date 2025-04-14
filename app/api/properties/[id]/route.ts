import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
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

export async function PUT(request: Request, { params }: Params) {
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
