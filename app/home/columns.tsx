"use client";

import type { ColumnDef, Column } from "@tanstack/react-table";
import { useUserStore } from "@/store/useUserStore";
import { ArrowDown, ArrowUp, MoreHorizontal, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import { Row } from "@tanstack/react-table";

interface ActionCellProps {
  row: Row<User>;
}

const ActionCell = ({ row }: ActionCellProps) => {
  const router = useRouter();
  const user = row.original;
  const currentUserPermission = useUserStore(
    (state) => state.metadata?.permission
  );

  if (currentUserPermission !== "admin") return null;

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
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={() => router.push(`/usuarios/${user.id}/visualizar`)}
          >
            <Eye className="h-4 w-4" />
            Visualizar detalhes
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={() => router.push(`/usuarios/${user.id}/editar`)}
          >
            <Edit className="h-4 w-4" />
            Editar usuário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export type User = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    permission?: string;
    properties?: Array<{
      property_id?: string;
      num_ven?: number;
      obra_ven?: string;
      status_ven?: number;
      empresa_ven?: number;
    }>;
  };
};

interface SortableHeaderProps {
  column: Column<User, unknown>;
  title: string;
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
  );
};

const formatCPF = (cpf: string | null | undefined) => {
  if (!cpf) return "";
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
};

const getRoleBadge = (role: string) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return <Badge variant="default">Admin</Badge>;
    case "cac analyst":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Analista
        </Badge>
      );
    case "moderator":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Moderador
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          Usuário
        </Badge>
      );
  }
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Nome" />,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => <SortableHeader column={column} title="CPF" />,
    cell: ({ row }) => <div>{formatCPF(row.getValue("cpf"))}</div>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <SortableHeader column={column} title="Cargo" />,
    cell: ({ row }) => getRoleBadge(row.getValue("role")),
  },
  {
    id: "actions",
    cell: (props) => <ActionCell row={props.row} />,
  },
];
