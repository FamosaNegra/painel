"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedPage } from "@/components/ProtectedPage"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Building, Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface UserProperty {
  num_ven: number;
  obra_ven: string;
  status_ven: number;
  empresa_ven: number;
  property_id: string;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  cpf: string;
  metadata: {
    properties?: UserProperty[];
    permission?: string;
  };
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
  }
  project_status: string
  facade: string
  logo?: string
}

export default function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser] = useState<UserType | null>(null)
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null)
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        if (!id) return

        setLoading(true)
        setError(null)

        const userRes = await fetchWithAuth(`/api/users/${id}`)
        if (!userRes.ok) throw new Error("Não foi possível carregar os dados do usuário")
        const userData = await userRes.json()
        setUser(userData)

        const propertyId = Array.isArray(userData?.metadata?.properties)
          ? userData.metadata.properties[0]?.property_id
          : undefined

        const allPropertiesRes = await fetchWithAuth("/api/properties/obras")
        if (!allPropertiesRes.ok) throw new Error("Não foi possível carregar a lista de empreendimentos")
        const allPropertiesData = await allPropertiesRes.json()
        setAllProperties(allPropertiesData)

        if (propertyId) {
          const propertyRes = await fetchWithAuth(`/api/properties/${propertyId}`)
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json()
            setCurrentProperty(propertyData)
            setSelectedPropertyId(propertyId)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setError("Ocorreu um erro ao carregar os dados")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const currentPropertyId = currentProperty?.id
      const updatedProperties = user.metadata.properties?.map((prop) => {
        if (prop.property_id === currentPropertyId) {
          return { ...prop, property_id: selectedPropertyId }
        }
        return prop
      }) || []

      const updatedMetadata = {
        ...user.metadata,
        properties: updatedProperties,
      }

      const res = await fetchWithAuth(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata: updatedMetadata }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erro ao atualizar usuário")
      }

      toast.success("Empreendimento atualizado com sucesso!", {
        description: "O usuário foi vinculado ao novo empreendimento.",
        duration: 5000,
      })

      setSuccess(true)
      setTimeout(() => router.push(`/usuarios/visualizar/${id}`), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido ao atualizar o usuário";
      console.error(err);
      setError(message);
      toast.error("Erro ao salvar", {
        description: message,
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-10 w-32" />
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

  return (
    <ProtectedPage permissionKey="USERS">
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
                <BreadcrumbLink href={`/usuarios/${id}/visualizar`}>Detalhes do Usuário</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Editar Empreendimento</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>
              Empreendimento atualizado com sucesso. Você será redirecionado em instantes...
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Empreendimento Atual
            </CardTitle>
            <CardDescription>Empreendimento atualmente associado ao usuário</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {currentProperty ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">{currentProperty.title}</h3>
                  {currentProperty.address && (
                    <p className="text-sm text-muted-foreground">
                      {currentProperty.address.street}, {currentProperty.address.number} -{" "}
                      {currentProperty.address.neighborhood}
                      {currentProperty.address.city && `, ${currentProperty.address.city}`}
                      {currentProperty.address.state && ` - ${currentProperty.address.state}`}
                    </p>
                  )}
                </div>
                <div>
                  {currentProperty.facade ? (
                    <div className="rounded-md overflow-hidden border">
                      <Image
                        src={currentProperty.facade || "/placeholder.svg"}
                        alt={`Fachada de ${currentProperty.title}`}
                        width={400}
                        height={200}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] bg-muted rounded-md">
                      <p className="text-muted-foreground">Sem imagem de fachada</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Building className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Nenhum empreendimento associado</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Este usuário não possui nenhum empreendimento associado à sua conta.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Empreendimento</CardTitle>
            <CardDescription>Selecione um novo empreendimento para associar a este usuário</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">Empreendimento</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger id="property" className="w-full">
                    <SelectValue placeholder="Selecione um empreendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push(`/usuarios/visualizar/${id}`)} disabled={saving}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || success || !selectedPropertyId}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedPage>
  )
}
