"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  UserRoundPlus,
  LogOut,
  ChevronLeft,
  Hammer,
  Menu,
  Video,
  ChartPie
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);
  const name = useUserStore((state) => state.name);
  const metadata = useUserStore((state) => state.metadata);
  const permission = metadata?.permission;
  const initials = name
    ? `${name.split(" ")[0][0]}${
        name.split(" ").length > 1 ? name.split(" ")[1][0] : ""
      }`
    : "U";

  // Detectar se é dispositivo móvel e colapsar automaticamente
  useEffect(() => {
    const checkIfMobile = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleLogout = async () => {
    clearUser();
    localStorage.removeItem("user");
    await signOut({ redirect: false });
    router.push("/login");
  };

  const navItems = [
    ...(permission === "admin" ||
    permission === "cac analyst" ||
    permission === "cac"
      ? [{ name: "Usuários", href: "/home", icon: Users }]
      : []),
    ...(permission === "admin"
      ? [
          {
            name: "Adicionar Usuários",
            href: "/usuarios/adicionar",
            icon: UserRoundPlus,
          },
        ]
      : []),
    ...(permission === "admin" || permission === "cac analyst"
      ? [{ name: "Obras", href: "/obras", icon: Hammer }]
      : []),
    ...(permission === "admin" || permission === "video"
      ? [{ name: "Tour", href: "/tour", icon: Video }]
      : []),
    ...(permission === "externo"
      ? [{ name: "análise", href: "/analise", icon: ChartPie }]
      : []),
  ];

  const getRoleBadge = () => {
    switch (permission?.toLowerCase()) {
      case "admin":
        return (
          <Badge variant="default" className="text-xs">
            Administrador
          </Badge>
        );
      case "cac analyst":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
          >
            Analista
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 text-xs"
          >
            {permission || "Usuário"}
          </Badge>
        );
    }
  };

  const NavigationItems = ({ mobile = false }: { mobile?: boolean }) => (
    <ul className={cn("space-y-1", mobile && "mt-4")}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <li key={item.name}>
            {collapsed && !mobile ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-md transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      aria-label={item.name}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  const MobileSidebar = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-background shadow-sm border"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px]">
        <div className="h-full flex flex-col bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-bold text-xl">Admin</div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <NavigationItems mobile />
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src="" alt={name || "Usuário"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{name || "Usuário"}</p>
                {getRoleBadge()}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const DesktopSidebar = () => (
    <aside
      className={cn(
        "h-screen bg-background border-r shadow-sm fixed top-0 left-0 flex-col transition-all duration-300 z-10 hidden md:flex",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b h-[60px]">
        {!collapsed && <span className="text-xl font-bold">Admin</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <NavigationItems />
      </nav>

      {collapsed ? (
        <div className="p-2 border-t flex flex-col items-center py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{name}</p>
                <p className="text-xs text-muted-foreground">{permission}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator className="my-2" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src="" alt={name || "Usuário"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{name || "Usuário"}</p>
              {getRoleBadge()}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      )}
    </aside>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
      <div
        className={cn(
          "hidden md:block transition-all duration-300",
          collapsed ? "ml-[70px]" : "ml-[240px]"
        )}
      />
    </>
  );
}
