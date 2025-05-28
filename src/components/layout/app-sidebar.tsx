
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FC } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter, // Importar SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Importar Avatar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Importar DropdownMenu
import { TicketCheck, LayoutDashboard, PlusSquare, Users, BarChart3, UserCircle, SettingsIcon, LogOutIcon } from "lucide-react";
import { useAuthStore } from "@/lib/hooks/useAuthStore";

const navItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/tickets/create", label: "Crear Ticket", icon: PlusSquare },
  { href: "/reports", label: "Informes", icon: BarChart3 },
];

const adminNavItems = [
  { href: "/admin/users", label: "Gestión de Usuarios", icon: Users },
];

export const AppSidebar: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout(); 
    router.push("/login"); 
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border p-2 flex items-center group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 shrink-0">
             <TicketCheck className="h-6 w-6" />
          </Button>
          <span className="group-data-[collapsible=icon]:hidden">DevTrack Lite</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href === "/" && pathname.startsWith("/tickets/") && pathname.endsWith("/edit")) || (item.href === "/reports" && pathname.startsWith("/reports"))}
                tooltip={{ children: item.label, className: "ml-2"}}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarMenu className="mt-4 pt-4 border-t border-sidebar-border">
           <SidebarMenuItem>
             <span className="px-2 text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Admin</span>
           </SidebarMenuItem>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)} 
                tooltip={{ children: item.label, className: "ml-2"}}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      {currentUser && (
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0">
                <Avatar className="h-7 w-7 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">{currentUser.name}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate max-w-[120px]">{currentUser.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2 group-data-[side=left]:ml-1 group-data-[side=right]:mr-1" side="top" align="start">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
