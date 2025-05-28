
"use client";
import type { FC } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
// Avatar y DropdownMenu ya no se usan directamente aquí para el perfil.
import { TicketCheck, Moon, Sun, PanelLeftOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// useAuthStore ya no se necesita aquí para currentUser o logout directamente.

export const AppHeader: FC = () => {
  // isMobile ya no se usa aquí para lógica de avatar
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  // currentUser y logout se manejarán en AppSidebar para el nuevo menú de perfil.

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (storedTheme) {
        setCurrentTheme(storedTheme);
        if (storedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        localStorage.setItem("theme", "light");
        document.documentElement.classList.remove("dark");
        setCurrentTheme("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                <PanelLeftOpen className="h-5 w-5" />
                <span className="sr-only">Alternar Menú</span>
              </Button>
            </SidebarTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Alternar Menú</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary mr-auto">
        <TicketCheck className="h-6 w-6" />
        <h1 className="hidden sm:block">DevTrack Lite</h1>
      </Link>
      
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8 md:h-9 md:w-9">
                {currentTheme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">
                  {currentTheme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{currentTheme === "light" ? "Modo Oscuro" : "Modo Claro"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* El DropdownMenu del perfil de usuario se ha movido a AppSidebar */}
      </div>
    </header>
  );
};
