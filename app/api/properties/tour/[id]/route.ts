import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { JsonObject } from "@prisma/client/runtime/library"; // Importa o tipo correto para metadata

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const { tour } = await request.json();

    const property = await prisma.properties.findUnique({
      where: { id },
      select: { metadata: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Empreendimento não encontrado" }, { status: 404 });
    }

    const metadata = property.metadata;

    const existingMetadata = typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)
      ? (metadata as JsonObject)
      : {};

    const updatedProperty = await prisma.properties.update({
      where: { id },
      data: {
        metadata: {
          ...existingMetadata,
          tour: tour || "", // aceita string vazia
        },
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, updated: updatedProperty });
  } catch (error) {
    console.error("Erro ao atualizar tour:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar tour" }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;

  try {
    const property = await prisma.properties.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        facade: true,
        metadata: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Empreendimento não encontrado" },
        { status: 404 }
      );
    }

    const metadata = property.metadata;
    const tour =
      typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)
        ? (metadata as JsonObject).tour
        : "";

    return NextResponse.json({
      id: property.id,
      title: property.title,
      facade: property.facade,
      tour: tour ?? "",
    });
  } catch (error) {
    console.error("Erro ao buscar tour:", error);
    return NextResponse.json(
      { error: "Erro ao buscar empreendimento" },
      { status: 500 }
    );
  }
}
