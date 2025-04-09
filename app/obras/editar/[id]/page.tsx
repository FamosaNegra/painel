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
import { Loader2, FileText, Upload, Trash2, Save } from "lucide-react"
import { toast } from "sonner"

export default function EditarObraPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/properties/${id}`)
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleRemovePdf = () => {
    setFormData((prev: any) => ({ ...prev, project_pdf: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Simulação de envio - substitua por sua API real
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast(
        "Alterações salvas. As informações da obra foram atualizadas com sucesso.")
      setSaving(false)
    } catch (error) {
      toast("Erro ao salvar. Ocorreu um erro ao salvar as alterações.")
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
            {/* Informações da Obra */}
            <Card>
              <CardContent className="pt-6">
                {data.logo && (
                  <div className="mb-4">
                    <Image
                      src={data.logo || "/placeholder.svg"}
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

            {/* Fachada */}
            <Card>
              <CardContent className="pt-6">
                {data.facade ? (
                  <Image
                    src={data.facade || "/placeholder.svg"}
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

          <Separator className="my-6" />

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_percentage">Percentual da Obra</Label>
                <Input
                  id="project_percentage"
                  type="number"
                  value={formData.project_percentage || ""}
                  onChange={(e) => handleChange("project_percentage", e.target.value)}
                  className="focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demolition">Demolição</Label>
                <Input
                  id="demolition"
                  type="number"
                  value={formData.demolition || ""}
                  onChange={(e) => handleChange("demolition", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="earthworks">Terraplanagem</Label>
                <Input
                  id="earthworks"
                  type="number"
                  value={formData.earthworks || ""}
                  onChange={(e) => handleChange("earthworks", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shallow_foundation">Fundação Rasa</Label>
                <Input
                  id="shallow_foundation"
                  type="number"
                  value={formData.shallow_foundation || ""}
                  onChange={(e) => handleChange("shallow_foundation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deep_foundation">Fundação Profunda</Label>
                <Input
                  id="deep_foundation"
                  type="number"
                  value={formData.deep_foundation || ""}
                  onChange={(e) => handleChange("deep_foundation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="structure">Estrutura</Label>
                <Input
                  id="structure"
                  type="number"
                  value={formData.structure || ""}
                  onChange={(e) => handleChange("structure", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finishing">Fechamento</Label>
                <Input
                  id="finishing"
                  type="number"
                  value={formData.finishing || ""}
                  onChange={(e) => handleChange("finishing", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enclosure">Acabamento</Label>
                <Input
                  id="enclosure"
                  type="number"
                  value={formData.enclosure || ""}
                  onChange={(e) => handleChange("enclosure", e.target.value)}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* PDF */}
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
            </div>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full sm:w-auto flex items-center gap-2" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {!saving && <Save className="h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
