
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "@/lib/hooks/useAuthStore";
import { useUserStore } from "@/lib/hooks/use-user-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100),
  email: z.string().email("El correo electrónico no es válido."),
  avatarUrl: z.string().optional(), // Puede ser un Data URL o una URL existente
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { currentUser, updateCurrentUserData, isAuthLoading } = useAuthStore();
  const { updateUser } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      avatarUrl: currentUser?.avatarUrl || "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
      });
      if (currentUser.avatarUrl) {
        setSelectedImagePreview(currentUser.avatarUrl);
      } else {
        setSelectedImagePreview(null);
      }
    }
  }, [currentUser, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Límite de 2MB
        toast({
          title: "Archivo Demasiado Grande",
          description: "Por favor, selecciona una imagen de menos de 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImagePreview(dataUrl);
        form.setValue("avatarUrl", dataUrl, { shouldDirty: true }); // Marcar como 'dirty'
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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
      const updateData: Partial<Omit<ProfileFormValues, "email">> = { name: data.name };
      if (form.formState.dirtyFields.avatarUrl && data.avatarUrl) { // Solo actualizar si el avatar cambió
        updateData.avatarUrl = data.avatarUrl;
      } else if (!data.avatarUrl && currentUser.avatarUrl) { // Si se borró el avatar
        updateData.avatarUrl = ""; // O undefined, dependiendo de cómo quieras manejarlo
      }


      const updatedUserInDb = updateUser(currentUser.id, updateData);

      if (updatedUserInDb) {
        updateCurrentUserData(updateData);
        
        toast({
          title: "¡Perfil Actualizado!",
          description: "Tu información ha sido actualizada exitosamente.",
        });
        form.reset({}, { keepValues: true, keepDirty: false, keepDefaultValues: false }); // Reset dirty state
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
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedImagePreview || currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback className="text-3xl">{getUserInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Cambiar Foto
              </Button>
              <Input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/png, image/jpeg, image/gif"
              />
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
