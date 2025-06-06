import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const allowedOrigin = "https://www.metrocasa.com.br";

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (origin !== allowedOrigin) {
    return NextResponse.json(
      { error: "Forbidden origin" },
      {
        status: 403,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      }
    );
  }

  try {
    const body = await req.json();

    const {
      name,
      rg,
      cpf,
      phone,
      birthDate,
      address,
      property,
      bank,
      isClient,
      indication,
    } = body;

    const newIndication = await prisma.indication.create({
      data: {
        name: String(name),
        rg: String(rg),
        cpf: String(cpf),
        phone: String(phone),
        birthDate: new Date(birthDate),
        address,
        property,
        bank,
        isClient: Boolean(isClient),
        indication,
        status: "new",
      },
    });

    return NextResponse.json(
      { success: true, data: newIndication },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      }
    );
  } catch (error) {
    console.error("Erro ao salvar indicação:", error);
    return NextResponse.json(
      { error: "Erro ao salvar indicação" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
      }
    );
  }
}
