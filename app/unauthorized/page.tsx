"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-red-100 p-4">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-red-600">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md">
          Você não tem permissão para acessar esta página. Se você acredita que isso é um erro, entre em contato com o administrador do sistema.
        </p>

        <Button asChild className="mt-6">
          <Link href="/home">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  );
}
