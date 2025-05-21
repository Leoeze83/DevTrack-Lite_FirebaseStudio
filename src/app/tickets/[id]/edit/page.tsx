
"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TicketForm } from "@/components/ticket-form";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import type { Ticket } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { getTicketById, isInitialized } = useTicketStore();
  const [ticketData, setTicketData] = useState<Ticket | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const ticketId = params.id ? parseInt(params.id as string, 10) : NaN;

  useEffect(() => {
    if (isInitialized && !isNaN(ticketId)) {
      const fetchedTicket = getTicketById(ticketId);
      if (fetchedTicket) {
        setTicketData(fetchedTicket);
      } else {
        // Podríamos redirigir a una página 404 o mostrar un mensaje
        console.warn(`Ticket con ID ${ticketId} no encontrado.`);
        // router.push('/404'); // O una página de error personalizada
      }
      setIsLoading(false);
    }
  }, [isInitialized, ticketId, getTicketById, router]);

  if (isLoading || !isInitialized) {
    return (
      <div className="container mx-auto py-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardContent className="pt-0 flex justify-end">
             <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticketData && !isLoading) {
     return (
      <div className="container mx-auto py-4">
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Ticket no encontrado</CardTitle>
            </CardHeader>
            <CardContent>
                <p>El ticket que intentas editar no existe o no se pudo cargar.</p>
                <button onClick={() => router.push('/')} className="mt-4 text-primary hover:underline">
                    Volver al Panel Principal
                </button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4">
      <TicketForm 
        ticketId={ticketId} 
        initialData={{
          title: ticketData?.title || "",
          description: ticketData?.description || "",
          category: ticketData?.category || "",
          priority: ticketData?.priority || "medium",
          // No pasamos status, tags, etc. porque el formulario actual no los maneja directamente para edición.
          // El store se encarga de mantener el status y otros campos no editables por el form directamente.
        }} 
      />
    </div>
  );
}
