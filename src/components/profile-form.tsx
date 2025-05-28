
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardSubTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "@/lib/hooks/useAuthStore";
import { useUserStore } from "@/lib/hooks/use-user-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CurrentUser, User } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100),
  email: z.string().email("El correo electrónico no es válido."),
  avatarUrl: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional().refine(val => !val || val.length === 0 || val.length >= 6, {
    message: "La nueva contraseña debe tener al menos 6 caracteres si se proporciona.",
  }),
  confirmNewPassword: z.string().optional(),
}).superRefine(({ newPassword, confirmNewPassword, currentPassword }, ctx) => {
  if (newPassword && newPassword !== confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las nuevas contraseñas no coinciden.",
      path: ["confirmNewPassword"],
    });
  }
  if (newPassword && !currentPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes ingresar tu contraseña actual para cambiarla.",
      path: ["currentPassword"],
    });
  }
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { currentUser, updateCurrentUserData, isAuthLoading } = useAuthStore();
  const userStore = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      avatarUrl: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl || "",
        currentPassword: "", // Siempre limpiar campos de contraseña al cargar
        newPassword: "",
        confirmNewPassword: "",
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
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          title: "Archivo Demasiado Grande",
          description: "Por favor, selecciona una imagen de menos de 2MB.",
          variant: "destructive",
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImagePreview(dataUrl);
        form.setValue("avatarUrl", dataUrl, { shouldDirty: true, shouldValidate: true });
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

    setIsSubmitting(true);
    let hasChanges = false;
    const dataToUpdateStore: Partial<Omit<User, "id" | "createdAt" | "email">> = {};

    if (form.formState.dirtyFields.name && data.name !== currentUser.name) {
      dataToUpdateStore.name = data.name;
      hasChanges = true;
    }
    if (form.formState.dirtyFields.avatarUrl && data.avatarUrl !== currentUser.avatarUrl) {
      dataToUpdateStore.avatarUrl = data.avatarUrl || "";
      hasChanges = true;
    }

    let passwordChangedSuccessfully = false;
    let passwordUpdateAttempted = false;

    if (data.newPassword && data.currentPassword) {
      passwordUpdateAttempted = true;
      // `updateUser` en el store ahora maneja la verificación de la contraseña actual
      const passwordUpdateResult = userStore.updateUser(
        currentUser.id,
        { password: data.newPassword }, // Solo pasar la nueva contraseña
        data.currentPassword // Pasar la contraseña actual para verificación
      );

      if (passwordUpdateResult && "error" in passwordUpdateResult) {
        toast({
          title: "Error al Cambiar Contraseña",
          description: passwordUpdateResult.error,
          variant: "destructive",
        });
        form.resetField("currentPassword");
        form.resetField("newPassword");
        form.resetField("confirmNewPassword");
        setIsSubmitting(false);
        return;
      } else if (passwordUpdateResult) {
        passwordChangedSuccessfully = true;
        hasChanges = true; // Consider password change as a change
        toast({
          title: "¡Contraseña Actualizada!",
          description: "Tu contraseña ha sido cambiada exitosamente.",
        });
      } else {
         // Esto podría pasar si el usuario no se encuentra, aunque no debería si currentUser existe
        toast({
          title: "Error al Cambiar Contraseña",
          description: "No se pudo actualizar la contraseña.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    } else if (data.newPassword && !data.currentPassword) {
        // Esta validación ya debería estar cubierta por Zod, pero por si acaso
        toast({
            title: "Información Faltante",
            description: "Por favor, ingresa tu contraseña actual para establecer una nueva.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
    }


    // Actualizar nombre y/o avatar si hubo cambios y no solo contraseña
    if ((form.formState.dirtyFields.name || form.formState.dirtyFields.avatarUrl) && !passwordUpdateAttempted) {
        const generalUpdateResult = userStore.updateUser(currentUser.id, dataToUpdateStore);
        if (!generalUpdateResult || (generalUpdateResult && "error" in generalUpdateResult)) {
             toast({
                title: "Error de Actualización",
                description: "No se pudo actualizar el perfil (nombre/avatar).",
                variant: "destructive",
            });
            // No retornar aquí si la contraseña sí se cambió.
            if(!passwordChangedSuccessfully) {
                 setIsSubmitting(false);
                 return;
            }
        }
    }


    if (!hasChanges) {
      toast({
        title: "Sin cambios",
        description: "No se detectaron cambios para guardar.",
      });
      setIsSubmitting(false);
      return;
    }

    // Actualizar currentUser en AuthStore (esto es para UI, el userStore ya persistió)
    const authUpdateData: Partial<Omit<CurrentUser, "id" | "email" | "createdAt">> = {};
    const latestUserDataFromStore = userStore.getUserById(currentUser.id); // Obtener los datos más frescos

    if (latestUserDataFromStore) {
      if (dataToUpdateStore.name || passwordChangedSuccessfully) { // Si el nombre cambió O la contraseña cambió (para reflejar en UI si es necesario)
        authUpdateData.name = latestUserDataFromStore.name;
      }
      if (dataToUpdateStore.avatarUrl !== undefined || passwordChangedSuccessfully) {
        authUpdateData.avatarUrl = latestUserDataFromStore.avatarUrl;
      }
      
      if(Object.keys(authUpdateData).length > 0) {
          updateCurrentUserData(authUpdateData);
      }
      
      toast({
        title: "¡Perfil Actualizado!",
        description: "Tu información ha sido actualizada exitosamente.",
      });

      form.reset(
        { 
          name: latestUserDataFromStore.name, 
          email: latestUserDataFromStore.email,
          avatarUrl: latestUserDataFromStore.avatarUrl || "",
          currentPassword: "", // Limpiar campos de contraseña
          newPassword: "",
          confirmNewPassword: "",
        }, 
        { keepDirty: false }
      );
      setSelectedImagePreview(latestUserDataFromStore.avatarUrl || null);
    }
    
    setIsSubmitting(false);
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
          Actualiza tu información personal y contraseña aquí.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">Información Personal</h3>
              <Separator />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={selectedImagePreview || undefined} alt={currentUser.name} data-ai-hint="user avatar" />
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
                    <Input type="email" placeholder="tu@email.com" {...field} readOnly className="cursor-not-allowed bg-muted/50"/>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground pt-1">El correo electrónico no se puede modificar.</p>
                </FormItem>
              )}
            />
            
            <div className="space-y-2 pt-4">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <KeyRound className="mr-2 h-5 w-5 text-primary" />
                Cambiar Contraseña
              </h3>
              <Separator />
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña Actual</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Tu contraseña actual" {...field} autoComplete="current-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Tu nueva contraseña" {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirma tu nueva contraseña" {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    