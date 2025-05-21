
"use client";

import type { FC } from "react";
import * as React from "react"; 
import type { Ticket, Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, CheckCircle2, CircleDot, Clock, Edit, LoaderCircle, MoreVertical, PauseCircle, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface TicketListItemProps {
  ticket: Ticket;
  onLogTimeClick: (ticket: Ticket) => void;
  onUpdateStatus: (ticketId: number, status: Status) => void;
}

const statusIcons: Record<Status, JSX.Element> = {
  Open: <CircleDot />,
  "In Progress": <LoaderCircle className="animate-spin" />,
  Pending: <PauseCircle />,
  Resolved: <CheckCircle2 />,
  Closed: <Archive />,
};

const statusColors: Record<Status, string> = {
  Open: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
  Resolved: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
  Closed: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
};

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
};

const priorityBadgeColors: Record<Ticket["priority"], string> = {
    high: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
    low: "bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200",
};


export const TicketListItem: FC<TicketListItemProps> = ({ ticket, onLogTimeClick, onUpdateStatus }) => {
  const availableStatuses: Status[] = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <div className="flex-grow">
                <Link href={`/tickets/${ticket.id}/edit`} className="group">
                    <CardTitle className="text-lg mb-1 line-clamp-2 group-hover:text-primary group-hover:underline">
                        #{ticket.id} - {ticket.title}
                    </CardTitle>
                </Link>
                <CardDescription className="text-sm text-muted-foreground line-clamp-2 min-h-[3rem]">
                {ticket.description}
                </CardDescription>
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-2">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Más acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem asChild>
                 <Link href={`/tickets/${ticket.id}/edit`} className="text-sm w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Ticket
                 </Link>
               </DropdownMenuItem>
              {availableStatuses.map(status => (
                <DropdownMenuItem 
                  key={status} 
                  onClick={() => onUpdateStatus(ticket.id, status)} 
                  disabled={ticket.status === status}
                  className="text-sm"
                >
                  {React.cloneElement(statusIcons[status], { className: `mr-2 h-4 w-4` })} 
                  <span>Marcar como {statusTranslations[status]}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </CardHeader>
      <CardContent className="space-y-3 flex-grow pb-4">
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
          <Badge variant="outline" className={`flex items-center gap-1.5 py-1 px-2 text-xs ${statusColors[ticket.status]}`}>
            {React.cloneElement(statusIcons[ticket.status], { className: `h-3.5 w-3.5` })}
            {statusTranslations[ticket.status]}
          </Badge>
          <Badge variant="secondary" className="py-1 px-2 text-xs">{ticket.category}</Badge>
          <Badge 
            variant={ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "outline" : "default"} 
            className={`py-1 px-2 text-xs ${priorityBadgeColors[ticket.priority]}`}
          >
            Prioridad: {priorityTranslations[ticket.priority]}
          </Badge>
        </div>
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ticket.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs font-normal bg-muted/50 px-1.5 py-0.5">{tag}</Badge>)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
        <div className="text-sm text-muted-foreground w-full">
            Registrado: {(ticket.timeLoggedMinutes / 60).toFixed(1)} hrs
        </div>
        <Button size="sm" onClick={() => onLogTimeClick(ticket)} className="w-full">
          <Timer className="mr-2 h-4 w-4" /> Registrar Tiempo
        </Button>
      </CardFooter>
    </Card>
  );
};
