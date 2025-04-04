"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Settings, Menu } from "lucide-react"
import { useState } from "react"
import clsx from "clsx"

const navItems = [
  { name: "Usuários", href: "/home", icon: Users },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={clsx(
        "h-screen bg-zinc-900 text-white shadow-lg fixed top-0 left-0 flex flex-col transition-all duration-300 z-10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-center px-4 py-4 border-b border-zinc-800 z-10">
        {!collapsed && <span className="text-2xl font-bold w-full">Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-white transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all justify-center",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-zinc-800 text-sm text-zinc-500">
          © {new Date().getFullYear()} Metrocasa
        </div>
      )}
    </aside>
  )
}
