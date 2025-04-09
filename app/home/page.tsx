"use client"

import { useEffect, useMemo, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./DataTable"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Users, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface CustomUser {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<CustomUser[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usersPerPage, setUsersPerPage] = useState(15)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/users")

        if (!res.ok) {
          throw new Error("Falha ao carregar usuários")
        }

        const data = await res.json()

        const extracted = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : []

        setUsers(extracted)
        setError(null)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
        setError("Não foi possível carregar a lista de usuários")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term) || user.cpf?.includes(term),
    )
  }, [search, users])

  const total = filtered.length
  const totalPages = Math.ceil(total / usersPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage
    return filtered.slice(start, start + usersPerPage)
  }, [filtered, currentPage, usersPerPage])

  // Gera os números de página para exibição na paginação
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Se tiver 5 ou menos páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas com elipses
      if (currentPage <= 3) {
        // Caso esteja nas primeiras páginas
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Caso esteja nas últimas páginas
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Caso esteja no meio
        pages.push(1)
        pages.push("ellipsis")
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo(0, 0)
    }
  }

  const renderPagination = () => {
    const pageNumbers = getPageNumbers()

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink onClick={() => handlePageChange(page as number)} isActive={currentPage === page}>
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Gerenciamento de Usuários
              </CardTitle>
              <CardDescription>Visualize e gerencie os usuários do sistema</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou email"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 w-full md:w-[300px]"
                />
              </div>

              <Button className="flex items-center gap-2" onClick={() => {}}>
                Novo Usuário
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="my-4" />

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="w-full h-10" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                {users.length > 0
                  ? "Tente ajustar os termos de busca para encontrar o usuário desejado."
                  : "Não há usuários cadastrados no sistema."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <DataTable columns={columns} data={paginatedData} />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Mostrar</span>
                  <Select
                    value={usersPerPage.toString()}
                    onValueChange={(value) => {
                      setUsersPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue placeholder="15" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>por página</span>
                </div>

                <div className="flex items-center gap-2">{renderPagination()}</div>

                <div className="text-sm text-muted-foreground">
                  Exibindo {Math.min(total, (currentPage - 1) * usersPerPage + 1)} a{" "}
                  {Math.min(total, currentPage * usersPerPage)} de {total} registros
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
