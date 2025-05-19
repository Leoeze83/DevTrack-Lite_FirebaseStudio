
"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import type { Ticket, Status, Priority } from "@/lib/types";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketsByStatusChart } from "./charts/tickets-by-status-chart";
import { TicketsByPriorityChart } from "./charts/tickets-by-priority-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, LayoutGrid, BarChartHorizontalBig, PieChartIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsCreatedOverTimeChart } from "./charts/tickets-created-over-time-chart";
import { TimeLoggedSummaryChart } from "./charts/time-logged-summary-chart";

const statusFilterTranslations: Record<Status | "all", string> = {
  all: "Todos los Estados",
  Open: "Abierto",
  "In Progress": "En Progreso",
  Pending: "Pendiente",
  Resolved: "Resuelto",
  Closed: "Cerrado",
};

const priorityFilterTranslations: Record<Priority | "all", string> = {
  all: "Todas las Prioridades",
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

type ViewMode = "grid" | "status-focus" | "priority-focus" | "time-focus" | "trends-focus";

export const ReportsDashboard: FC = () => {
  const { tickets, isInitialized } = useTicketStore();
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => filterStatus === "all" || ticket.status === filterStatus)
      .filter(ticket => filterPriority === "all" || ticket.priority === filterPriority);
  }, [tickets, filterStatus, filterPriority]);

  if (!isInitialized) {
    // Puedes agregar un skeleton loader más elaborado aquí
    return <p>Cargando informes...</p>;
  }

  const renderCharts = () => {
    if (filteredTickets.length === 0 && (filterStatus !== "all" || filterPriority !== "all")) {
       return (
         <Alert variant="default" className="col-span-1 md:col-span-2 lg:col-span-4 mt-6 bg-accent/10 border-accent/30">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle>No hay Tickets con los Filtros Actuales</AlertTitle>
          <AlertDescription>
            No se encontraron tickets que coincidan con los filtros seleccionados. Intenta ajustarlos.
          </AlertDescription>
        </Alert>
       );
    }
    if (tickets.length === 0) {
      return (
        <Alert variant="default" className="col-span-1 md:col-span-2 lg:col-span-4 mt-6 bg-blue-500/10 border-blue-500/30 text-blue-700">
          <PieChartIcon className="h-5 w-5 text-blue-600" />
          <AlertTitle>No Hay Tickets Aún</AlertTitle>
          <AlertDescription>
            No hay tickets registrados en el sistema. Una vez que crees algunos, podrás ver los informes aquí.
          </AlertDescription>
        </Alert>
      );
    }

    switch (viewMode) {
      case "grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
            <TicketsByStatusChart tickets={filteredTickets} />
            <TicketsByPriorityChart tickets={filteredTickets} />
            <TicketsCreatedOverTimeChart tickets={filteredTickets} />
            <TimeLoggedSummaryChart tickets={filteredTickets} />
          </div>
        );
      case "status-focus":
        return <div className="mt-6"><TicketsByStatusChart tickets={filteredTickets} detailed /></div>;
      case "priority-focus":
        return <div className="mt-6"><TicketsByPriorityChart tickets={filteredTickets} detailed /></div>;
      case "time-focus":
         return <div className="mt-6"><TimeLoggedSummaryChart tickets={filteredTickets} detailed /></div>;
      case "trends-focus":
        return <div className="mt-6"><TicketsCreatedOverTimeChart tickets={filteredTickets} detailed /></div>;
      default:
        return null;
    }
  };
  
  const ViewModeButton: FC<{mode: ViewMode; label: string; icon: JSX.Element}> = ({mode, label, icon}) => (
    <Button
        variant={viewMode === mode ? "default" : "outline"}
        onClick={() => setViewMode(mode)}
        className="flex-1 sm:flex-initial"
      >
        {icon}
        <span className="ml-2 hidden sm:inline">{label}</span>
      </Button>
  );


  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Filtros de Informes</CardTitle>
          <CardDescription>Ajusta los filtros para refinar los datos mostrados en los gráficos.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Status | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(statusFilterTranslations) as Array<Status | "all">).map(key => (
                <SelectItem key={key} value={key}>{statusFilterTranslations[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Priority | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(priorityFilterTranslations) as Array<Priority | "all">).map(key => (
                <SelectItem key={key} value={key}>{priorityFilterTranslations[key]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Visualización de Gráficos</CardTitle>
            <CardDescription>Selecciona una vista o explora la cuadrícula de gráficos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <ViewModeButton mode="grid" label="Cuadrícula" icon={<LayoutGrid className="h-4 w-4"/>} />
            <ViewModeButton mode="status-focus" label="Por Estado" icon={<PieChartIcon className="h-4 w-4"/>} />
            <ViewModeButton mode="priority-focus" label="Por Prioridad" icon={<BarChartHorizontalBig className="h-4 w-4"/>} />
            <ViewModeButton mode="trends-focus" label="Tendencias" icon={<BarChart3 className="h-4 w-4"/>} />
            <ViewModeButton mode="time-focus" label="Tiempo Registrado" icon={<Info className="h-4 w-4"/>} />
        </CardContent>
      </Card>

      {renderCharts()}
    </div>
  );
};
