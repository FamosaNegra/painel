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
