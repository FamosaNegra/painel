"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedPage } from "@/components/ProtectedPage"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Home,
  Pencil,
  Plus,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PropertyMetadata {
  num_ven?: number
  obra_ven?: string
  status_ven?: number
  empresa_ven?: number
  property_id?: string
}

interface UserType {
  id: string
  name: string
  email: string
  cpf: string
  email_verified: boolean
  created_at: string
  metadata: {
    properties?: PropertyMetadata[]
    permission?: string
    phone?: string
    uau_id?: string
  }
}

interface Property {
  id: string
  title: string
  address: {
    street: string
    number: string
    neighborhood: string
    city?: string
    state?: string
    zip?: string
  }
  project_status: string
  facade: string
  logo?: string
  project_evolution?: {
    project_percentage?: number
  }
}

export default function VisualizarUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser] = useState<UserType | null>(null)
  const [properties, setProperties] = useState<Map<string, Property>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        if (!id) return

        setLoading(true)
        setError(null)

        const userRes = await fetchWithAuth(`/api/users/${id}`)

        if (!userRes.ok) {
          throw new Error("Não foi possível carregar os dados do usuário")
        }

        const userData = await userRes.json()
        setUser(userData)

        // Fetch all properties associated with the user
        if (Array.isArray(userData?.metadata?.properties) && userData.metadata.properties.length > 0) {
          const propertiesMap = new Map<string, Property>()
          const uniquePropertyIds = new Set<string>()

          // Get unique property IDs
          userData.metadata.properties.forEach((prop: { property_id?: string }) => {
            if (prop.property_id) {
              uniquePropertyIds.add(prop.property_id)
            }
          })

          // Fetch each property
          const propertyPromises = Array.from(uniquePropertyIds).map(async (propertyId) => {
            const propertyRes = await fetchWithAuth(`/api/properties/${propertyId}`)
            if (propertyRes.ok) {
              const propertyData = await propertyRes.json()
              propertiesMap.set(propertyId, propertyData)
            }
          })

          await Promise.all(propertyPromises)
          setProperties(propertiesMap)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
        setError("Ocorreu um erro ao carregar os dados do usuário")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return ""
    // Remove qualquer caractere que não seja número
    const numbers = cpf.replace(/\D/g, "")
    // Se tiver o tamanho correto, formata como XXX.XXX.XXX-XX
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return cpf
  }

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Função para obter a badge de status do projeto
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "under_construction":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Em Construção
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
            {status || "Não Definido"}
          </Badge>
        )
    }
  }

  // Função para obter a badge de papel do usuário
  const getRoleBadge = (permission: string) => {
    switch (permission?.toLowerCase()) {
      case "admin":
        return <Badge>Administrador</Badge>
      case "cac analyst":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Analista CAC
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {permission || "Usuário"}
          </Badge>
        )
    }
  }

  // Função para obter os detalhes adicionais de um empreendimento
  const getPropertyDetails = (propertyMetadata: PropertyMetadata) => {
    return (
      <div className="text-sm text-muted-foreground mt-1">
        {propertyMetadata.num_ven && <span>Venda: {propertyMetadata.num_ven}</span>}
        {propertyMetadata.obra_ven && <span className="ml-2">Obra: {propertyMetadata.obra_ven}</span>}
        {propertyMetadata.empresa_ven && <span className="ml-2">Empresa: {propertyMetadata.empresa_ven}</span>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error || "Usuário não encontrado"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  // Agrupar propriedades por ID para exibição
  const propertyGroups = new Map<string, PropertyMetadata[]>()
  if (user.metadata?.properties) {
    user.metadata.properties.forEach((prop) => {
      if (prop.property_id) {
        if (!propertyGroups.has(prop.property_id)) {
          propertyGroups.set(prop.property_id, [])
        }
        propertyGroups.get(prop.property_id)?.push(prop)
      }
    })
  }

  return (
    <ProtectedPage permissionKey="ADMIN">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/home">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/home">Usuários</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Detalhes do Usuário</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {getRoleBadge(user.metadata?.permission || "")}
              {user.email_verified ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Email Verificado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Email Não Verificado
                </Badge>
              )}
            </div>
          </div>
          <div className="ml-auto mt-4 md:mt-0">
            {/* <Button
              onClick={() => router.push(`/usuarios/${user.id}/adicionar-empreendimento`)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Empreendimento
            </Button> */}
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="property">Empreendimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações do Usuário
                  </CardTitle>
                  <CardDescription>Dados pessoais e informações de contato</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nome Completo</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">{formatCPF(user.cpf)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{user.metadata?.phone || "Não informado"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Informações da Conta
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ID do Usuário</p>
                      <p className="font-mono text-xs bg-muted p-2 rounded">{user.id}</p>
                    </div>
                    {user.metadata?.uau_id && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">ID UAU</p>
                        <p className="font-mono text-xs bg-muted p-2 rounded">{user.metadata.uau_id}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Data de Criação</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Função</p>
                      <p className="font-medium">{user.metadata?.permission || "Usuário"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status do Email</p>
                      {user.email_verified ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <p className="font-medium">Verificado</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="font-medium">Não Verificado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="property">
            {propertyGroups.size > 0 ? (
              <div className="space-y-6">
                {Array.from(propertyGroups.entries()).map(([propertyId, propertyMetadataList]) => {
                  const property = properties.get(propertyId)

                  return (
                    <Card key={propertyId}>
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <Building className="h-5 w-5 text-primary" />
                              {property ? property.title : "Carregando..."}
                            </CardTitle>
                            <CardDescription>
                              {propertyMetadataList.length > 1
                                ? `${propertyMetadataList.length} unidades neste empreendimento`
                                : "Empreendimento Associado"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {property && getStatusBadge(property.project_status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/usuarios/${user?.id}/editar/`)}
                              className="flex items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-6">
                        {property ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="space-y-4">
                                {property.address && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Endereço</p>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <p className="font-medium">
                                        {`${property.address.street}, ${property.address.number}`}
                                        <br />
                                        {`${property.address.neighborhood}`}
                                        {property.address.city && `, ${property.address.city}`}
                                        {property.address.state && ` - ${property.address.state}`}
                                        {property.address.zip && ` (${property.address.zip})`}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Progresso da Obra</p>
                                  <div className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">
                                      {property.project_evolution?.project_percentage || 0}% concluído
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">ID do Empreendimento</p>
                                  <p className="font-mono text-xs bg-muted p-2 rounded">{property.id}</p>
                                </div>

                                {/* Detalhes das unidades */}
                                {propertyMetadataList.length > 0 && (
                                  <div className="space-y-2 mt-4">
                                    <p className="font-medium">Unidades</p>
                                    <div className="space-y-3">
                                      {propertyMetadataList.map((metadata, index) => (
                                        <div key={index} className="bg-muted/50 p-3 rounded-md">
                                          {getPropertyDetails(metadata)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {property.logo && (
                                <div className="mt-6">
                                  <p className="text-sm text-muted-foreground mb-2">Logo</p>
                                  <div className="bg-muted/50 p-4 rounded-md flex items-center justify-center">
                                    <Image
                                      src={property.logo || "/placeholder.svg"}
                                      alt="Logo do Empreendimento"
                                      width={200}
                                      height={80}
                                      className="object-contain"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {property.facade && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Fachada</p>
                                <div className="rounded-md overflow-hidden border">
                                  <Image
                                    src={property.facade || "/placeholder.svg"}
                                    alt="Fachada do Empreendimento"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-6">
                            <Skeleton className="h-[200px] w-full rounded-lg" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Nenhum empreendimento associado</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Este usuário não possui nenhum empreendimento associado à sua conta.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push(`/usuarios/${user.id}/adicionar-empreendimento`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Empreendimento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </ProtectedPage>
  )
}
