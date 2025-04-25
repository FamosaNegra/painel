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
  tokenCustom: string | null
  setUser: (data: {
    name: string
    email: string
    cpf: string
    role: string
    metadata: Metadata
    tokenCustom: string
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
      tokenCustom: null,

      setUser: ({ name, email, cpf, role, metadata, tokenCustom }) =>
        set({ name, email, cpf, role, metadata, tokenCustom }),

      clearUser: () =>
        set({
          name: null,
          email: null,
          cpf: null,
          role: null,
          metadata: null,
          tokenCustom: null,
        }),
    }),
    {
      name: "user-store",
      // Garantia de que só dados serializáveis vão para o localStorage
      partialize: (state) => ({
        name: state.name,
        email: state.email,
        cpf: state.cpf,
        role: state.role,
        metadata: state.metadata,
        tokenCustom: state.tokenCustom,
      }),
    }
  )
)
