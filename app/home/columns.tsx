"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type User = {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  createdAt?: string
  updatedAt?: string
}

interface SortableHeaderProps {
  column: any
  title: string
}

const SortableHeader = ({ column, title }: SortableHeaderProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="font-medium"
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-3.5 w-3.5" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-3.5 w-3.5" />
      ) : null}
    </Button>
  )
}

// Função auxiliar para formatar CPF
const formatCPF = (cpf: string | null | undefined) => {
  if (!cpf) return ""
  // Remove qualquer caractere que não seja número
  const numbers = cpf.replace(/\D/g, "")
  // Se tiver o tamanho correto, formata como XXX.XXX.XXX-XX
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }
  return cpf
}

// Função para obter a badge de papel do usuário
const getRoleBadge = (role: string) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return <Badge variant="default">Admin</Badge>
    case "cac analyst":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Analista
        </Badge>
      )
    case "moderator":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Moderador
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Usuário
        </Badge>
      )
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Nome" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => <SortableHeader column={column} title="CPF" />,
    cell: ({ row }) => <div>{formatCPF(row.getValue("cpf"))}</div>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <SortableHeader column={column} title="Papel" />,
    cell: ({ row }) => getRoleBadge(row.getValue("role")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualizar detalhes
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar usuário
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir usuário
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
