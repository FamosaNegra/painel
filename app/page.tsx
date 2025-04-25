import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  redirect("/home")
}
