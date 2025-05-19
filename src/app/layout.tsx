
// Ya no es un Client Component, se elimina "use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeInitializer } from "@/components/layout/theme-initializer"; // Importar el nuevo componente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata ahora se puede exportar correctamente desde un Server Component.
export const metadata: Metadata = {
  title: "DevTrack Lite",
  description: "Support ticket management and time tracking system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // La lógica de useEffect para el tema se ha movido a ThemeInitializer

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeInitializer /> {/* Añadir el ThemeInitializer aquí */}
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
