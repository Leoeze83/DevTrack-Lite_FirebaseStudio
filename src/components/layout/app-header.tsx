
"use client";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, TicketCheck, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const AppHeader: FC = () => {
  const { isMobile } = useSidebar();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Asegurarse de que esto solo se ejecute en el cliente
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
        // Si no hay tema guardado, se asume light por defecto
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
      {isMobile && <SidebarTrigger />}
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
        <TicketCheck className="h-6 w-6" />
        <h1 className="group-data-[collapsible=icon]:hidden">DevTrack Lite</h1>
      </Link>
      
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
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

        {!isMobile && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                      <PanelLeftOpen className="h-5 w-5" />
                      <span className="sr-only">Alternar Menú</span>
                  </Button>
                </SidebarTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Alternar Menú</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
};
