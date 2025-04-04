"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await signIn("credentials", {
      email,
      cpf,
      redirect: false,
    })
    if (res?.ok) router.push("/home")
    else alert("Email ou CPF inválido")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
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
