
"use client";
import type { FC } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, TicketCheck } from "lucide-react";
import Link from "next/link";

export const AppHeader: FC = () => {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && <SidebarTrigger />}
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
        <TicketCheck className="h-6 w-6" />
        <h1>DevTrack Lite</h1>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {!isMobile && <SidebarTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
                <PanelLeftOpen className="h-5 w-5" />
                <span className="sr-only">Alternar Menú</span>
            </Button>
        </SidebarTrigger>}
      </div>
    </header>
  );
};
