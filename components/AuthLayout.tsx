"use client"

import { useUserStore } from "@/store/useUserStore"
import Sidebar from "@/components/Sidebar"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const role = useUserStore(state => state.role)

  // só mostra o layout completo se estiver logado
  const isLoggedIn = !!role

  if (!isLoggedIn) {
    return <>{children}</> // apenas a página (ex: login)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-muted/40 p-6">{children}</main>
    </div>
  )
}
