
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      setIsDarkMode(false);
      localStorage.setItem("theme", "light");
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Configuración</h1>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Preferencias de la Aplicación</CardTitle>
          <CardDescription>Gestiona tus preferencias de la aplicación aquí.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" placeholder="Tu nombre de usuario" defaultValue="DevUser" />
          </div>
          
          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notificaciones</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Notificaciones por correo electrónico
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe actualizaciones por correo electrónico para eventos importantes.
                </p>
              </div>
              <Switch
                id="email-notifications"
                aria-label="Activar notificaciones por correo electrónico"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-base">
                  Notificaciones Push
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones push en tus dispositivos. (¡Próximamente!)
                </p>
              </div>
              <Switch
                id="push-notifications"
                disabled
                aria-label="Activar notificaciones push"
              />
            </div>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Tema</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
               <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">
                  Modo Oscuro
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activa o desactiva el modo oscuro para la aplicación.
                </p>
              </div>
              <Switch
                id="dark-mode"
                aria-label="Activar modo oscuro"
                checked={isDarkMode}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
