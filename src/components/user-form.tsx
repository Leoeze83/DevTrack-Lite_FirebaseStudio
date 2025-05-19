
"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUserStore } from "@/lib/hooks/use-user-store";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const userFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").max(100),
  email: z.string().email("El correo electrónico no es válido.").min(5, "El correo electrónico debe tener al menos 5 caracteres."),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  // userId?: string; // Para modo edición en el futuro
}

export const UserForm: FC<UserFormProps> = ({ /* userId */ }) => {
  const { addUser } = useUserStore(); // Añadir getUsers, getUserById, updateUser para edición
  const { toast } = useToast();
  const router = useRouter();
  // const isEditMode = Boolean(userId);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Lógica para cargar datos en modo edición se añadiría aquí

  const onSubmit = (data: UserFormValues) => {
    // if (isEditMode && userId) {
    //   // Lógica de actualización
    // } else {
      const newUser = addUser(data);
      toast({
        title: "¡Usuario Creado!",
        description: `El usuario "${newUser.name}" ha sido creado exitosamente.`,
      });
    // }
    form.reset();
    router.push("/admin/users"); 
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>{/*isEditMode ? "Editar Usuario" :*/ "Crear Nuevo Usuario"}</CardTitle>
        <CardDescription>
          {/*isEditMode ? "Actualiza los detalles del usuario." :*/ "Completa los detalles para registrar un nuevo usuario."}
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
                    <Input placeholder="ej: Juan Pérez" {...field} />
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
                    <Input type="email" placeholder="ej: juan.perez@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Otros campos como rol, contraseña (con confirmación) podrían ir aquí en el futuro */}
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => router.back()} className="mr-auto">
              Cancelar
            </Button>
            <Button type="submit" className="ml-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {/*isEditMode ? "Guardar Cambios" :*/ "Crear Usuario"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
