
"use client";

import type { FC } from "react";
import type { Ticket, Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, CheckCircle2, CircleDot, Clock, HelpCircle, LoaderCircle, MoreVertical, PauseCircle, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale"; // Importar locale español
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TicketListItemProps {
  ticket: Ticket;
  onLogTimeClick: (ticket: Ticket) => void;
  onUpdateStatus: (ticketId: string, status: Status) => void;
}

const statusIcons: Record<Status, JSX.Element> = {
  Open: <CircleDot className="h-4 w-4" />,
  "In Progress": <LoaderCircle className="h-4 w-4 animate-spin" />,
  Pending: <PauseCircle className="h-4 w-4" />,
  Resolved: <CheckCircle2 className="h-4 w-4" />,
  Closed: <Archive className="h-4 w-4" />,
};

const statusColors: Record<Status, string> = {
  Open: "bg-blue-100 text-blue-700 border-blue-300",
  "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Pending: "bg-orange-100 text-orange-700 border-orange-300",
  Resolved: "bg-green-100 text-green-700 border-green-300",
  Closed: "bg-gray-100 text-gray-700 border-gray-300",
};

// Mapeo de status a español para el Dropdown y el Badge
const statusTranslations: Record<Status, string> = {
  Open: "Abierto",
  "In Progress": "En Progreso",
  Pending: "Pendiente",
  Resolved: "Resuelto",
  Closed: "Cerrado",
};

const priorityTranslations: Record<Ticket["priority"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
}


export const TicketListItem: FC<TicketListItemProps> = ({ ticket, onLogTimeClick, onUpdateStatus }) => {
  const availableStatuses: Status[] = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg mb-1">{ticket.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Más acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableStatuses.map(status => (
                <DropdownMenuItem key={status} onClick={() => onUpdateStatus(ticket.id, status)} disabled={ticket.status === status}>
                  {statusIcons[status]} <span className="ml-2">Marcar como {statusTranslations[status]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {ticket.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Creado {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: es })}</span>
            </div>
            {ticket.updatedAt !== ticket.createdAt && (
                 <div className="flex items-center gap-1">
                    <span>Act. {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true, locale: es })}</span>
                </div>
            )}
        </div>
         <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className={`flex items-center gap-1.5 py-1 px-2.5 text-xs ${statusColors[ticket.status]}`}>
            {React.cloneElement(statusIcons[ticket.status], { className: `h-3.5 w-3.5` })}
            {statusTranslations[ticket.status]}
          </Badge>
          <Badge variant="secondary" className="py-1 px-2.5 text-xs">{ticket.category}</Badge>
          <Badge 
            variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "outline" : "default" } 
            className={`py-1 px-2.5 text-xs ${ticket.priority === "medium" ? "border-yellow-500 text-yellow-600 bg-yellow-50" : ticket.priority === "low" ? "bg-sky-100 text-sky-700 border-sky-300" : ""}`}
          >
            Prioridad: {priorityTranslations[ticket.priority]}
          </Badge>
        </div>
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ticket.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs font-normal bg-muted/50">{tag}</Badge>)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
            Registrado: {(ticket.timeLoggedMinutes / 60).toFixed(1)} hrs
        </div>
        <Button size="sm" onClick={() => onLogTimeClick(ticket)}>
          <Timer className="mr-2 h-4 w-4" /> Registrar Tiempo
        </Button>
      </CardFooter>
    </Card>
  );
};
