
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "@/lib/hooks/useAuthStore";
import { useUserStore } from "@/lib/hooks/use-user-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const profileFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100),
  email: z.string().email("El correo electrónico no es válido."),
  // Podríamos añadir más campos aquí, como avatarUrl, etc.
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { currentUser, updateCurrentUserData, isAuthLoading } = useAuthStore();
  const { updateUser } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No hay un usuario autenticado para actualizar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Actualizar en el userStore (nuestra "base de datos" de usuarios)
      const updatedUserInDb = updateUser(currentUser.id, { name: data.name });

      if (updatedUserInDb) {
        // 2. Actualizar el currentUser en el authStore para reflejar el cambio inmediatamente en la UI
        updateCurrentUserData({ name: data.name });
        
        toast({
          title: "¡Perfil Actualizado!",
          description: "Tu nombre ha sido actualizado exitosamente.",
        });
      } else {
         toast({
          title: "Error de Actualización",
          description: "No se pudo actualizar el perfil en la base de datos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast({
        title: "Error Inesperado",
        description: "Ocurrió un error al actualizar tu perfil.",
        variant: "destructive",
      });
    }
  };
  
  if (isAuthLoading) {
     return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Perfil no disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se pudo cargar la información del perfil. Por favor, intenta iniciar sesión de nuevo.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">Ir a Login</Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Mi Perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal aquí.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground pt-1">El correo electrónico no se puede modificar.</p>
                </FormItem>
              )}
            />
            {/* Aquí podríamos añadir campos para Avatar URL, cambiar contraseña, etc. en el futuro */}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
