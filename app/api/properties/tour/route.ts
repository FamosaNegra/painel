import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.properties.findMany({
      take: 100, // limita a 100 registros
      orderBy: {
        title: "asc", // ordena alfabeticamente por título
      },
      select: {
        id: true,
        title: true,
        facade: true,
        metadata: true,
      },
    });

    // Inclui tour diretamente se estiver em metadata
    const formatted = properties.map((property) => {
      const metadata =
        typeof property.metadata === "object" &&
        property.metadata !== null &&
        !Array.isArray(property.metadata)
          ? property.metadata
          : {};

      return {
        id: property.id,
        title: property.title,
        facade: property.facade,
        tour: metadata?.tour ?? "",
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro ao buscar propriedades:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
