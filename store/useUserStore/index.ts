import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Metadata {
  permission: string
  [key: string]: any
}

interface UserState {
  name: string | null
  email: string | null
  cpf: string | null
  role: string | null
  metadata: Metadata | null
  setUser: (data: {
    name: string
    email: string
    cpf: string
    role: string
    metadata: Metadata
  }) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      cpf: null,
      role: null,
      metadata: null,
      setUser: ({ name, email, cpf, role, metadata }) =>
        set({ name, email, cpf, role, metadata }),
      clearUser: () =>
        set({ name: null, email: null, cpf: null, role: null, metadata: null }),
    }),
    {
      name: "user-store",
    }
  )
)
