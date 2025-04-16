"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/useUserStore"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Building2, Loader2, PlusCircle, Edit, AlertCircle, Construction } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { fetchWithAuth } from "@/lib/fetchWithAuth"

interface Property {
  id: string
  title: string
  project_status: "under_construction" | "launch" | "ready_to_move_in" | null
  facade?: string
  project_evolution?: {
    project_percentage?: number
  }
}

export default function ObrasPage() {
  const router = useRouter()
  const permission = useUserStore((state) => state.metadata?.permission)
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (permission !== "admin" && permission !== "cac analyst") {
      router.push("/unauthorized")
    }
  }, [permission, router])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const res = await fetchWithAuth("/api/properties/obras")

        if (!res.ok) {
          throw new Error("Falha ao carregar as obras")
        }

        const data = await res.json()
        setProperties(data)
        setError(null)
      } catch (err) {
        setError("Não foi possível carregar a lista de obras")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const filtered = useMemo(() => {
    return properties.filter((property) => property.title.toLowerCase().includes(search.toLowerCase()))
  }, [search, properties])

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "under_construction":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Construction className="h-3 w-3" />
            Em Obras
          </Badge>
        )
      case "launch":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Lançamento
          </Badge>
        )
      case "ready_to_move_in":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Pronto para Morar
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Não Definido
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Obras em Andamento
              </CardTitle>
              <CardDescription>Gerencie e acompanhe o progresso das obras</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full md:w-[300px]"
                />
              </div>

              {/* Nova Obra */}
              {/* <Button className="flex items-center gap-2" onClick={() => router.push("/obras/nova")}>
                <PlusCircle className="h-4 w-4" />
                Nova Obra
              </Button> */}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Separator className="my-4" />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando obras...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Nenhuma obra encontrada</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                {properties.length > 0
                  ? "Tente ajustar os filtros de busca para encontrar o que procura."
                  : "Não há obras cadastradas no sistema. Clique em 'Nova Obra' para adicionar."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="w-[100px]">Fachada</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((property) => (
                      <TableRow key={property.id} className="hover:bg-muted/50">
                        <TableCell>
                          {property.facade ? (
                            <div className="relative h-16 w-20 overflow-hidden rounded-md border">
                              <Image
                                src={property.facade || "/placeholder.svg"}
                                alt={property.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-16 w-20 bg-muted rounded-md border">
                              <Building2 className="h-6 w-6 text-muted-foreground opacity-50" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{getStatusBadge(property.project_status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1 w-full max-w-[200px]">
                            <div className="flex justify-between text-xs">
                              <span>Progresso</span>
                              <span className="font-medium">
                                {property.project_evolution?.project_percentage ?? 0}%
                              </span>
                            </div>
                            <Progress value={property.project_evolution?.project_percentage ?? 0} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => router.push(`/obras/editar/${property.id}`)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Exibindo {filtered.length} de {properties.length} obras
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
