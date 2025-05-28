
"use client";

import { useState, useEffect } from "react"; // Importar useEffect
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/hooks/useAuthStore";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Por favor, ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, currentUser, isAuthLoading } = useAuthStore(); // Añadir isAuthLoading
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Solo redirigir si la autenticación no está cargando y el usuario ya existe
    if (!isAuthLoading && currentUser) {
      router.replace("/");
    }
  }, [currentUser, isAuthLoading, router]);

  // Si la autenticación está cargando o ya hay un usuario (y la redirección está en curso),
  // podríamos mostrar un loader o null para evitar renderizar el formulario innecesariamente.
  if (isAuthLoading || currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const success = await login(data.email, data.password);
    setIsLoading(false);

    if (success) {
      toast({
        title: "¡Inicio de Sesión Exitoso!",
        description: "Bienvenido de nuevo.",
      });
      // El useEffect se encargará de la redirección si currentUser se actualiza
      // No es necesario router.push("/") aquí si el useEffect ya lo maneja.
      // Sin embargo, para una redirección inmediata tras el login, podría mantenerse,
      // pero asegurándose de que no cause conflictos con el useEffect.
      // Por ahora, confiamos en el useEffect.
    } else {
      toast({
        title: "Error de Inicio de Sesión",
        description: "Correo electrónico o contraseña incorrectos. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      form.setValue("password", ""); // Limpiar campo de contraseña en error
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar Sesión en DevTrack Lite</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Tu contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
