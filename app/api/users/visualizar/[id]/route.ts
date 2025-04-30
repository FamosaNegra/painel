import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const property = await prisma.properties.findUnique({
      where: {
        id,
      },
      select: {
        title: true,
        project_status: true,
        facade: true,
        address: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Empreendimento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Erro ao buscar o Empreendimento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
