import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      where: { role: "customer" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, cpf, role: originalRole } = body

    if (!name || !email || !cpf || !originalRole) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    // lógica de role/metadata ajustada
    let finalRole = originalRole
    let metadata = {}

    if (
      originalRole === "cac" ||
      originalRole === "cac senior" ||
      originalRole === "cac analyst"
    ) {
      finalRole = "cac"
      metadata = { permission: originalRole }
    } else if (originalRole === "designer") {
      finalRole = "marketing"
      metadata = { permission: "designer" }
    }

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        cpf,
        role: finalRole,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        metadata,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
