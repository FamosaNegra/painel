"use client"

import { useEffect, useMemo, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./DataTable"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CustomUser {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export default function HomePage() {
  const [users, setUsers] = useState<CustomUser[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 15

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users")
        const data = await res.json()

        const extracted = Array.isArray(data)
          ? data
          : Array.isArray(data.users)
          ? data.users
          : []

        setUsers(extracted)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      }
    }

    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return users.filter(
      user =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.cpf?.includes(term)
    )
  }, [search, users])

  const total = filtered.length
  const totalPages = Math.ceil(total / usersPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage
    return filtered.slice(start, start + usersPerPage)
  }, [filtered, currentPage])

  return (
    <div className="p-6 space-y-4 pl-24">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold">Usuários ({total})</div>
        <Input
          placeholder="Buscar por nome, CPF ou email"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setCurrentPage(1) // Volta para a página 1 ao buscar
          }}
          className="w-96"
        />
      </div>

      {paginatedData.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          Usuário não encontrado
        </Card>
      ) : (
        <ScrollArea className="rounded-lg border">
          <DataTable columns={columns} data={paginatedData} />
        </ScrollArea>
      )}

      {/* Controles de paginação */}
      <div className="flex justify-center gap-4 mt-4 items-center">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-muted text-sm disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-muted-foreground text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-muted text-sm disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
