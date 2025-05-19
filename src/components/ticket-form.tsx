
"use client";

import type { FC } from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import type { Priority } from "@/lib/types";
import { categorizeTicketDescription, CategorizationResult } from "@/app/actions";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const ticketFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(100),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").max(1000),
  category: z.string().min(1, "La categoría es obligatoria.").max(50),
  priority: z.enum(["low", "medium", "high"], { required_error: "La prioridad es obligatoria." }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const TicketForm: FC = () => {
  const { addTicket } = useTicketStore();
  const { toast } = useToast();
  const router = useRouter();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: undefined,
    },
  });

  const handleAutoCategorize = async () => {
    const description = form.getValues("description");
    if (!description.trim()) {
      toast({
        title: "No se puede categorizar",
        description: "Por favor, ingresa una descripción primero.",
        variant: "destructive",
      });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeTicketDescription(description);
      if ("error" in result) {
        toast({
          title: "Falló la Categorización IA",
          description: result.error,
          variant: "destructive",
        });
      } else {
        form.setValue("category", result.category, { shouldValidate: true });
        form.setValue("priority", result.priority, { shouldValidate: true });
        toast({
          title: "Categorización IA Exitosa",
          description: `Categoría establecida a "${result.category}" y prioridad a "${result.priority}".`,
        });
      }
    } catch (error) {
       toast({
          title: "Error en Categorización IA",
          description: "Ocurrió un error inesperado.",
          variant: "destructive",
        });
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (data: TicketFormValues) => {
    const newTicket = addTicket(data);
    toast({
      title: "¡Ticket Creado!",
      description: `El ticket "${newTicket.title}" ha sido creado exitosamente.`,
    });
    form.reset();
    router.push("/"); // Navigate to dashboard after creation
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Crear Nuevo Ticket de Soporte</CardTitle>
        <CardDescription>Completa los detalles a continuación para enviar un nuevo ticket. ¡Usa la función de categorización IA para ayudarte!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: Problema de inicio de sesión en la app móvil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe el problema en detalle..." {...field} rows={5} />
                  </FormControl>
                  <FormDescription>
                    Cuanta más información proporciones, más rápido podremos ayudarte.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="outline" onClick={handleAutoCategorize} disabled={isCategorizing} className="w-full sm:w-auto">
              {isCategorizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              IA Auto-Categorizar y Priorizar
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="ej: Reporte de Bug, Solicitud de Característica" {...field} />
                    </FormControl>
                    <FormDescription>
                      Sugerencia IA o entrada manual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                     <FormDescription>
                      Sugerencia IA o entrada manual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full sm:w-auto ml-auto" disabled={form.formState.isSubmitting || isCategorizing}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Crear Ticket
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
