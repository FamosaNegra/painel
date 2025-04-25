"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditarObraPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(false)
  }, [id])

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="pl-24 p-6 space-y-4">
      <h1 className="text-2xl font-bold">Editar Obra</h1>
      <p>ID da obra: <span className="font-mono">{id}</span></p>

      {/* Formulário de edição será adicionado aqui depois */}
    </div>
  )
}
