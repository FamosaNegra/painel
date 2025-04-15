"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { useUserStore } from "@/store/useUserStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Lock, Mail, User } from "lucide-react"

const loginFormSchema = z.object({
  email: z.string().email({ message: "Digite um email válido" }),
  cpf: z
    .string()
    .min(11, { message: "CPF deve ter pelo menos 11 dígitos" })
    .refine((cpf) => {
      const numbers = cpf.replace(/\D/g, "")
      return numbers.length === 11
    }, { message: "CPF inválido" })
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export default function LoginPage() {
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      cpf: "",
    },
  })

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = localStorage.getItem("user")
        if (stored) {
          const parsed = JSON.parse(stored)
          setUser(parsed)
          router.push("/home")
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        localStorage.removeItem("user")
      } finally {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router, setUser])

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const formattedData = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
      }

      const res = await signIn("credentials", {
        redirect: false,
        email: formattedData.email,
        cpf: formattedData.cpf,
      })

      if (res?.ok) {
        const session = await getSession()
        if (session?.user) {
          const metadata = session.user.metadata || {}
          const timestamp = session.user.loginTimestamp || Date.now()
          const permission = metadata.permission || ""
          const apiKey = process.env.NEXT_PUBLIC_API_KEY || ""
          const tokenCustom = btoa(`${permission}.${timestamp}.${apiKey}`)

          const userData = {
            name: session.user.name || "",
            email: session.user.email || "",
            cpf: session.user.cpf || "",
            role: session.user.role || "",
            metadata,
            tokenCustom,
          }

          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          router.push("/home")
        } else {
          setError("Não foi possível obter os dados do usuário")
        }
      } else {
        setError("Email ou CPF inválido")
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      setError("Ocorreu um erro ao tentar fazer login")
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Painel Administrativo</CardTitle>
          <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="seu@email.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
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
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-sm text-muted-foreground mt-4">
            Ao fazer login, você concorda com os termos de uso e política de privacidade.
          </p>
        </CardFooter>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        &copy; {new Date().getFullYear()} Marketing Metrocasa. Todos os direitos reservados.
      </p>
    </div>
  )
}
