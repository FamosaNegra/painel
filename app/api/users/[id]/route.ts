import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        email_verified: true,
        created_at: true,
        metadata: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { metadata } = body;

    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        metadata,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        email_verified: true,
        created_at: true,
        metadata: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
