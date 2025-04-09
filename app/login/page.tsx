"use client"

import { useUserStore } from "@/store/useUserStore"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { permission } from "process"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const router = useRouter()
  const setUser = useUserStore(state => state.setUser)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      router.push("/home")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await signIn("credentials", {
      redirect: false,
      email,
      cpf,
    })

    if (res?.ok) {
      const session = await getSession()
      if (session?.user) {
        const metadata = session.user.metadata || {}

        const userData = {
          name: session.user.name || "",
          email: session.user.email || "",
          cpf: session.user.cpf || "",
          role: session.user.role || "",
          metadata,
          permission: metadata.permission,
        }

        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        router.push("/home")
      } else {
        alert("Email ou CPF inválido")
      }
    } else {
      alert("Email ou CPF inválido")
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-8 rounded-xl flex flex-col gap-4 w-96"
      >
        <h1 className="text-white text-2xl font-bold">Painel Admin</h1>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-zinc-800 text-white"
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="p-2 rounded bg-zinc-800 text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
