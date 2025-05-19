
"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import type { Ticket, Status } from "@/lib/types";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import { TicketListItem } from "./ticket-list-item";
import { LogTimeDialog } from "./log-time-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, SearchX } from "lucide-react"; // SearchX para "no resultados"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mapeo de status a español para filtros
const statusFilterTranslations: Record<Status | "all", string> = {
  all: "Todos los Estados",
  Open: "Abierto",
  "In Progress": "En Progreso",
  Pending: "Pendiente",
  Resolved: "Resuelto",
  Closed: "Cerrado",
};

const priorityFilterTranslations: Record<Ticket["priority"] | "all", string> = {
  all: "Todas las Prioridades",
  low: "Baja",
  medium: "Media",
  high: "Alta",
}

export const TicketList: FC = () => {
  const { tickets, logTimeForTicket, updateTicketStatus, isInitialized } = useTicketStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLogTimeDialogOpen, setIsLogTimeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Ticket["priority"] | "all">("all");

  const handleLogTimeClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsLogTimeDialogOpen(true);
  };

  const handleLogTimeSubmit = (ticketId: string, durationMinutes: number, notes?: string) => {
    logTimeForTicket(ticketId, durationMinutes, notes);
    setIsLogTimeDialogOpen(false);
    setSelectedTicket(null);
  };
  
  const filteredTickets = tickets
    .filter(ticket => 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.tags && ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(ticket => filterStatus === "all" || ticket.status === filterStatus)
    .filter(ticket => filterPriority === "all" || ticket.priority === filterPriority);

  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => ( // Mostrar 4 esqueletos para coincidir con xl:grid-cols-4
            <Card key={i} className="shadow-md">
              <CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></CardHeader>
              <CardContent className="space-y-3"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-6 w-3/4" /></CardContent>
              <CardFooter className="flex justify-between items-center"><Skeleton className="h-8 w-1/4" /><Skeleton className="h-10 w-1/3" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input 
          placeholder="Buscar por título, descripción, categoría o tag..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Status | "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(statusFilterTranslations) as Array<Status | "all">).map(key => (
              <SelectItem key={key} value={key}>{statusFilterTranslations[key]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Ticket["priority"] | "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por prioridad" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(priorityFilterTranslations) as Array<Ticket["priority"] | "all">).map(key => (
              <SelectItem key={key} value={key}>{priorityFilterTranslations[key]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <Alert variant="default" className="bg-sky-50 border-sky-300 text-sky-700">
          <Info className="h-5 w-5 text-sky-600" />
          <AlertTitle>No Hay Tickets Aún</AlertTitle>
          <AlertDescription>
            Parece que no hay tickets registrados en el sistema. ¡Crea tu primer ticket para empezar! (Se generarán 10 tickets de ejemplo en la primera carga si no hay datos existentes).
          </AlertDescription>
        </Alert>
      ) : filteredTickets.length === 0 ? (
         <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-700">
          <SearchX className="h-5 w-5 text-amber-600" />
          <AlertTitle>No se Encontraron Tickets</AlertTitle>
          <AlertDescription>
            No hay tickets que coincidan con tus filtros actuales. Intenta ajustar tu búsqueda o los filtros aplicados.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketListItem key={ticket.id} ticket={ticket} onLogTimeClick={handleLogTimeClick} onUpdateStatus={updateTicketStatus} />
          ))}
        </div>
      )}
      <LogTimeDialog
        open={isLogTimeDialogOpen}
        onOpenChange={setIsLogTimeDialogOpen}
        ticket={selectedTicket}
        onLogTime={handleLogTimeSubmit}
      />
    </div>
  );
};

// Dummy Card for Skeleton
const Card: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);
const CardContent: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);
const CardFooter: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>
);
