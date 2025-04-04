"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { User } from "next-auth"

interface SortableHeaderProps {
  column: any
  title: string
}

const SortableHeader = ({ column, title }: SortableHeaderProps) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
      {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
    </Button>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Nome" />,
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "cpf",
    header: ({ column }) => <SortableHeader column={column} title="CPF" />,
    cell: ({ row }) => <div>{row.getValue("cpf")}</div>,
  },
]
