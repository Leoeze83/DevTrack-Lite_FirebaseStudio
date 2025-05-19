
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TicketCheck, LayoutDashboard, PlusSquare, Settings, LogOut, Users, BarChart3, List } from "lucide-react";

const navItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/tickets/create", label: "Crear Ticket", icon: PlusSquare },
  // { href: "/tickets", label: "Todos los Tickets", icon: List }, // Comentado o eliminado
  { href: "/reports", label: "Informes", icon: BarChart3 }, // Nuevo enlace de Informes
];

const adminNavItems = [
  { href: "/admin/users", label: "Gestión de Usuarios", icon: Users },
];

export const AppSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:justify-center">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
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
                isActive={pathname === item.href || (item.href === "/reports" && pathname.startsWith("/reports"))} // Ajuste para isActive
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
      <SidebarFooter className="p-2 border-t border-sidebar-border">
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={{ children: "Configuración", className: "ml-2"}}
                isActive={pathname === "/settings"}
              >
                <Link href="/settings">
                  <Settings />
                  <span>Configuración</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Cerrar Sesión", className: "ml-2"}} variant="outline">
                <Link href="#"> 
                  <LogOut />
                  <span>Cerrar Sesión</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
