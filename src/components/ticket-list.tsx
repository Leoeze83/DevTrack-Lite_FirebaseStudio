
"use client";

import type { FC } from "react";
import { useState, useEffect, useMemo } from "react";
import type { Ticket, Status } from "@/lib/types";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import { TicketListItem } from "./ticket-list-item";
import { LogTimeDialog } from "./log-time-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, SearchX, LayoutGrid, List as ListIcon, MoreVertical, Timer, CircleDot, LoaderCircle, PauseCircle, CheckCircle2, Archive, Edit, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import * as React from "react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";


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
};

const statusIcons: Record<Status, JSX.Element> = {
  Open: <CircleDot className="h-4 w-4" />,
  "In Progress": <LoaderCircle className="h-4 w-4 animate-spin" />,
  Pending: <PauseCircle className="h-4 w-4" />,
  Resolved: <CheckCircle2 className="h-4 w-4" />,
  Closed: <Archive className="h-4 w-4" />,
};

const statusColorsClasses: Record<Status, string> = {
  Open: "bg-blue-100 text-blue-700 border-blue-300",
  "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-300",
  Pending: "bg-orange-100 text-orange-700 border-orange-300",
  Resolved: "bg-green-100 text-green-700 border-green-300",
  Closed: "bg-gray-100 text-gray-700 border-gray-300",
};

const priorityBadgeColors: Record<Ticket["priority"], string> = {
    high: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
    low: "bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200",
};

type SortableColumn = 'id'; // Expand later if needed for other columns

export const TicketList: FC = () => {
  const { tickets, logTimeForTicket, updateTicketStatus, isInitialized } = useTicketStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLogTimeDialogOpen, setIsLogTimeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Ticket["priority"] | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortConfig, setSortConfig] = useState<{ key: SortableColumn, direction: 'asc' | 'desc' }>({ key: 'id', direction: 'desc' });

  const handleLogTimeClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsLogTimeDialogOpen(true);
  };

  const handleLogTimeSubmit = (ticketId: number, durationMinutes: number, notes?: string) => {
    logTimeForTicket(ticketId, durationMinutes, notes);
    setIsLogTimeDialogOpen(false);
    setSelectedTicket(null);
  };
  
  const sortedAndFilteredTickets = useMemo(() => {
    let filtered = tickets
      .filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.tags && ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .filter(ticket => filterStatus === "all" || ticket.status === filterStatus)
      .filter(ticket => filterPriority === "all" || ticket.priority === filterPriority);

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [tickets, searchTerm, filterStatus, filterPriority, sortConfig]);

  const handleSortChange = (key: SortableColumn) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const availableStatuses: Status[] = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

  if (!isInitialized) {
    // Skeleton loading state (unchanged)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-24 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => ( 
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
  
  const renderSortArrow = (columnKey: SortableColumn) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row gap-4 items-center">
          <Input 
            placeholder="Buscar por título, descripción, categoría o tag..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Status | "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusFilterTranslations) as Array<Status | "all">).map(key => (
                  <SelectItem key={key} value={key}>{statusFilterTranslations[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Ticket["priority"] | "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(priorityFilterTranslations) as Array<Ticket["priority"] | "all">).map(key => (
                  <SelectItem key={key} value={key}>{priorityFilterTranslations[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 self-start md:self-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Vista de Grilla">
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Vista de Grilla</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="Vista de Lista">
                    <ListIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Vista de Lista</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
       </div>

      {tickets.length === 0 ? (
        <Alert variant="default" className="bg-sky-50 border-sky-300 text-sky-700">
          <Info className="h-5 w-5 text-sky-600" />
          <AlertTitle>No Hay Tickets Aún</AlertTitle>
          <AlertDescription>
            Parece que no hay tickets registrados en el sistema. ¡Crea tu primer ticket para empezar! (Se generarán 10 tickets de ejemplo en la primera carga si no hay datos existentes).
          </AlertDescription>
        </Alert>
      ) : sortedAndFilteredTickets.length === 0 ? (
         <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-700">
          <SearchX className="h-5 w-5 text-amber-600" />
          <AlertTitle>No se Encontraron Tickets</AlertTitle>
          <AlertDescription>
            No hay tickets que coincidan con tus filtros actuales. Intenta ajustar tu búsqueda o los filtros aplicados.
          </AlertDescription>
        </Alert>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAndFilteredTickets.map((ticket) => (
            <TicketListItem key={ticket.id} ticket={ticket} onLogTimeClick={handleLogTimeClick} onUpdateStatus={updateTicketStatus} />
          ))}
        </div>
      ) : (
        <Card className="shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] px-2 py-3">
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('id')}
                      className="font-semibold text-xs px-1 py-0.5 h-auto hover:bg-muted"
                    >
                      ID
                      {renderSortArrow('id')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[250px] px-2 py-3 text-xs font-semibold">Título</TableHead>
                  <TableHead className="w-[150px] px-2 py-3 text-xs font-semibold">Categoría</TableHead>
                  <TableHead className="w-[120px] px-2 py-3 text-xs font-semibold">Prioridad</TableHead>
                  <TableHead className="w-[150px] px-2 py-3 text-xs font-semibold">Estado</TableHead>
                  <TableHead className="w-[100px] px-2 py-3 text-xs font-semibold">Creado</TableHead>
                  <TableHead className="w-[110px] px-2 py-3 text-xs font-semibold">Tiempo Reg.</TableHead>
                  <TableHead className="w-[100px] text-right px-2 py-3 text-xs font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="text-xs">
                    <TableCell className="font-medium px-2 py-2.5">
                      <Link href={`/tickets/${ticket.id}/edit`} className="hover:text-primary hover:underline">
                          #{ticket.id}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs md:max-w-sm lg:max-w-md truncate px-2 py-2.5" title={ticket.title}>{ticket.title}</TableCell>
                    <TableCell className="px-2 py-2.5">
                      <Badge variant="secondary" className="text-xs font-normal">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <Badge 
                          className={`text-xs font-normal ${priorityBadgeColors[ticket.priority]}`}
                      >
                          {priorityFilterTranslations[ticket.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <Badge variant="outline" className={`flex items-center gap-1.5 text-xs font-normal ${statusColorsClasses[ticket.status]}`}>
                        {React.cloneElement(statusIcons[ticket.status], { className: 'h-3 w-3' })}
                        {statusFilterTranslations[ticket.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs px-2 py-2.5">{format(parseISO(ticket.createdAt), "dd MMM yy", { locale: es })}</TableCell>
                    <TableCell className="text-xs px-2 py-2.5">{(ticket.timeLoggedMinutes / 60).toFixed(1)} hrs</TableCell>
                    <TableCell className="text-right px-2 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                          <TooltipProvider>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLogTimeClick(ticket)}>
                                          <Timer className="h-3.5 w-3.5" />
                                          <span className="sr-only">Registrar Tiempo</span>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top"><p>Registrar Tiempo</p></TooltipContent>
                              </Tooltip>
                          </TooltipProvider>
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                  <span className="sr-only">Más acciones</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                               <DropdownMenuItem asChild className="text-xs">
                                 <Link href={`/tickets/${ticket.id}/edit`} className="w-full">
                                    <Edit className="mr-2 h-3.5 w-3.5" />
                                    Editar Ticket
                                 </Link>
                               </DropdownMenuItem>
                              {availableStatuses.map(status => (
                              <DropdownMenuItem 
                                  key={status} 
                                  onClick={() => updateTicketStatus(ticket.id, status)} 
                                  disabled={ticket.status === status}
                                  className="text-xs"
                              >
                                  {React.cloneElement(statusIcons[status], { className: `mr-2 h-3.5 w-3.5` })} 
                                  <span>Marcar como {statusFilterTranslations[status]}</span>
                              </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
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
