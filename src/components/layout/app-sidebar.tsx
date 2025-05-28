
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation"; // No necesitamos useRouter aquí
import type { FC } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter, // No se usará SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TicketCheck, LayoutDashboard, PlusSquare, Settings, Users, BarChart3 } from "lucide-react";
// useAuthStore ya no se necesita aquí para logout

const navItems = [
  { href: "/", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/tickets/create", label: "Crear Ticket", icon: PlusSquare },
  { href: "/reports", label: "Informes", icon: BarChart3 },
];

const adminNavItems = [
  { href: "/admin/users", label: "Gestión de Usuarios", icon: Users },
];

// Los enlaces de Cuenta (Perfil, Configuración) y Cerrar Sesión se mueven al AppHeader
// const userNavItems = [
//   { href: "/profile", label: "Mi Perfil", icon: UserCircle2 },
//   { href: "/settings", label: "Configuración", icon: Settings },
// ];

export const AppSidebar: FC = () => {
  const pathname = usePathname();
  // const router = useRouter(); // Ya no es necesario aquí
  // const { logout, currentUser } = useAuthStore(); // Ya no es necesario aquí

  // const handleLogout = () => { // Movido a AppHeader
  //   logout(); 
  //   router.push("/login"); 
  // };

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
        
        {/* Sección de Admin */}
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

        {/* La Sección de Cuenta (Perfil y Configuración) y Cerrar Sesión se han movido al AppHeader */}
      </SidebarContent>
      {/* SidebarFooter ya no es necesario */}
    </Sidebar>
  );
};
