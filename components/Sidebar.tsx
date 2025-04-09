"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  UserRoundPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useUserStore } from "@/store/useUserStore";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);
  const name = useUserStore((state) => state.name);
  const metadata = useUserStore((state) => state.metadata);
  const permission = metadata?.permission;
  const role = useUserStore((state) => state.role);

  const handleLogout = async () => {
    clearUser();
    localStorage.removeItem("user");
    await signOut({ redirect: false });
    router.push("/login");
  };

  const firstName = name?.split(" ")[0] || "Usuário";

  const navItems = [
    { name: "Usuários", href: "/home", icon: Users },
    ...(permission === "admin"
      ? [
          {
            name: "Adicionar Usuários",
            href: "/usuarios/adicionar",
            icon: UserRoundPlus,
          },
        ]
      : []),
  ];

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
  className={clsx(
    "text-zinc-400 hover:text-white transition-transform duration-300",
    collapsed && "rotate-180"
  )}
>
  <ChevronLeft className="h-5 w-5 transition-transform duration-300" />
</button>

      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
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
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-zinc-800 text-sm text-zinc-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1 mb-2 rounded-md text-left text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
          <div className="text-white font-medium">{firstName}</div>
          {permission && (
            <div className="text-xs text-zinc-400 capitalize">{permission}</div>
          )}
        </div>
      )}
    </aside>
  );
}
