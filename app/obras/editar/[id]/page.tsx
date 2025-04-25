"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, FileText, Save, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/fetchWithAuth"

interface ProjectEvolution {
  project_percentage?: number
  demolition?: number
  earthworks?: number
  shallow_foundation?: number
  deep_foundation?: number
  structure?: number
  finishing?: number
  enclosure?: number
  project_pdf?: string
}

interface ObraData {
  id: string
  title: string
  logo?: string
  facade?: string
  address?: {
    street: string
    number: string
    neighborhood: string
  }
  project_evolution?: ProjectEvolution
}

export default function EditarObraPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<ObraData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ProjectEvolution>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithAuth(`/api/properties/${id}`)
        const result = await res.json()
        setData(result)
        setFormData(result.project_evolution || {})
        setLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const handleChange = (field: keyof ProjectEvolution, value: string) => {
    const parsedValue = value === "" ? undefined : Number(value)
    setFormData((prev) => ({
      ...prev,
      [field]: parsedValue,
    }))
  }

  // const handleRemovePdf = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     project_pdf: "",
  //   }))
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const res = await fetchWithAuth(`/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_evolution: formData }),
      })

      if (!res.ok) throw new Error("Erro ao salvar alterações")

      toast.success("Alterações salvas com sucesso!", {
        description: "Os dados da obra foram atualizados.",
        duration: 5000,
      })

      setTimeout(() => {
        setSuccess(true)
        setSaving(false)
        router.push("/obras")
      }, 3000)
    } catch (error) {
      console.error("Erro ao salvar alterações:", error)
      toast.error("Erro ao salvar", {
        description: "Ocorreu um problema ao salvar as alterações.",
        duration: 3000,
      })
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando...</span>
      </div>
    )
  }

  if (!data?.id) {
    return (
      <Card className="max-w-lg mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-medium text-red-600">Obra não encontrada</h3>
            <p className="text-muted-foreground mt-2">Não foi possível encontrar os dados desta obra.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">Editar Obra: {data.title}</CardTitle>
          <CardDescription>Atualize as informações de evolução da obra</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                {data.logo && (
                  <div className="mb-4">
                    <Image
                      src={data.logo}
                      alt="Logo"
                      width={300}
                      height={100}
                      className="object-contain rounded-md border"
                    />
                  </div>
                )}
                {data.address && (
                  <p className="text-sm text-muted-foreground">
                    Rua: {data.address.street}, {data.address.number} - {data.address.neighborhood}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {data.facade ? (
                  <Image
                    src={data.facade}
                    alt="Fachada"
                    width={400}
                    height={240}
                    className="object-cover rounded-md border w-full h-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[200px] bg-muted rounded-md">
                    <p className="text-muted-foreground">Sem imagem de fachada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Sucesso!</AlertTitle>
              <AlertDescription>Obras atualizadas. Você será redirecionado em instantes...</AlertDescription>
            </Alert>
          )}

          <Separator className="my-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "project_percentage",
                "demolition",
                "earthworks",
                "shallow_foundation",
                "deep_foundation",
                "structure",
                "finishing",
                "enclosure",
              ].map((field) => (
                <div className="space-y-2" key={field}>
                  <Label htmlFor={field}>{field.replace("_", " ")}</Label>
                  <Input
                    id={field}
                    type="number"
                    value={formData[field as keyof ProjectEvolution] ?? ""}
                    onChange={(e) => handleChange(field as keyof ProjectEvolution, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* <Separator className="my-4" />

            <div className="space-y-2">
              <Label>Documento do Projeto</Label>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {formData.project_pdf ? (
                  <>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" type="button" asChild>
                      <a href={formData.project_pdf} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        Ver PDF
                      </a>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      type="button"
                      onClick={handleRemovePdf}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir PDF
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="secondary" size="sm" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload PDF
                  </Button>
                )}
              </div>
            </div> */}

            <CardFooter className="px-0 pt-2">
              <Button type="submit" className="w-full sm:w-auto flex items-center gap-2" disabled={saving || success}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
