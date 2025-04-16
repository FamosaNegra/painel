"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserStore } from "@/store/useUserStore"
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  Mail,
  User,
  CreditCard,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { fetchWithAuth } from "@/lib/fetchWithAuth"

// Esquema de validação com Zod
const userFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "O nome não pode ter mais de 100 caracteres" }),
  email: z.string().email({ message: "Digite um email válido" }),
  cpf: z
    .string()
    .min(11, { message: "CPF deve ter 11 dígitos" })
    .max(14, { message: "CPF não pode ter mais de 14 caracteres" })
    .refine(
      (cpf) => {
        // Remove caracteres não numéricos para validação
        const numbers = cpf.replace(/\D/g, "")
        return numbers.length === 11
      },
      { message: "CPF inválido" },
    ),
  role: z.string().min(1, { message: "Selecione uma função" }),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function AdicionarUsuarioPage() {
  const router = useRouter()
  const { metadata } = useUserStore()
  const permission = metadata?.permission
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  // Inicializa o formulário com React Hook Form + Zod
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      role: "",
    },
  })

  useEffect(() => {
    if (permission !== "admin") {
      router.push("/unauthorized")
    }
  }, [permission, router])

  // Função para formatar o CPF enquanto o usuário digita
  const formatCPF = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, "")

    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    }
  }

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Remover formatação do CPF antes de enviar
      const formattedData = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
      }

      const res = await fetchWithAuth("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Erro ao criar usuário")
      }

      setSuccess(true)
      form.reset()

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/home")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Ocorreu um erro ao adicionar o usuário.")
    } finally {
      setLoading(false)
    }
  }

  // Funções para navegar entre as abas
  const goToNextTab = () => {
    setActiveTab("access")
  }

  const goToPreviousTab = () => {
    setActiveTab("basic")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/users">Usuários</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Adicionar Usuário</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary" />
                Adicionar Usuário
              </CardTitle>
              <CardDescription>Preencha os dados para criar um novo usuário no sistema</CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              {success && (
                <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Sucesso!</AlertTitle>
                  <AlertDescription>
                    Usuário criado com sucesso. Você será redirecionado em instantes...
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="access">Acesso ao Sistema</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                  <Form {...form}>
                    <form className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Digite o nome completo" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>Nome que será exibido no sistema.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="000.000.000-00"
                                  className="pl-10"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatCPF(e.target.value)
                                    field.onChange(formatted)
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>CPF do usuário (apenas números).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="button" onClick={goToNextTab}>
                          Próximo
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="access">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="email" placeholder="email@exemplo.com" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>Email para acesso ao sistema.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Função</FormLabel>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Selecione uma função" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cac">CAC & R.I</SelectItem>
                                  <SelectItem value="cac senior">Coordenação CAC & R.I</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                  <SelectItem value="cac analyst">CAC (Obras)</SelectItem>
                                  <SelectItem value="designer">Designer</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <FormDescription>A função determina as permissões do usuário no sistema.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={goToPreviousTab}>
                          Voltar
                        </Button>
                        <Button type="submit" disabled={loading || success} className="gap-2">
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Adicionando...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Adicionar Usuário
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Informações</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Sobre as funções</h3>
                  <p className="text-muted-foreground">
                    A função do usuário determina quais recursos e permissões ele terá acesso no sistema.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Administrador</h3>
                  <p className="text-muted-foreground">
                    Tem acesso completo ao sistema, incluindo gerenciamento de usuários e configurações.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">CAC Analyst</h3>
                  <p className="text-muted-foreground">
                    Pode gerenciar obras e acompanhar o progresso dos projetos de construção.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Outros papéis</h3>
                  <p className="text-muted-foreground">
                    Têm acesso limitado a recursos específicos relacionados às suas funções.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Ações</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/users")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para lista de usuários
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
