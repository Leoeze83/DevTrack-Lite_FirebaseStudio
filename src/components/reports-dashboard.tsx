
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
import { Info, LayoutGrid, BarChartHorizontalBig, PieChartIcon, BarChart3, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsCreatedOverTimeChart } from "./charts/tickets-created-over-time-chart";
import { TimeLoggedSummaryChart } from "./charts/time-logged-summary-chart";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      .filter(ticket => filterPriority === "all" || ticket.priority === filterPriority)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, filterStatus, filterPriority]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Informe de Tickets de Soporte", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Filtros aplicados: Estado - ${statusFilterTranslations[filterStatus]}, Prioridad - ${priorityFilterTranslations[filterPriority]}`, 14, 30);
    doc.text(`Informe generado el: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 14, 36);

    const tableColumn = ["ID", "Título", "Categoría", "Prioridad", "Estado", "Creado", "Actualizado", "Tiempo Reg. (min)"];
    const tableRows: (string | number)[][] = [];

    filteredTickets.forEach(ticket => {
      const ticketData = [
        ticket.id.substring(0, 8), // Shortened ID
        ticket.title,
        ticket.category,
        priorityFilterTranslations[ticket.priority],
        statusFilterTranslations[ticket.status],
        format(new Date(ticket.createdAt), "dd/MM/yy", { locale: es }),
        format(new Date(ticket.updatedAt), "dd/MM/yy", { locale: es }),
        ticket.timeLoggedMinutes
      ];
      tableRows.push(ticketData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] }, // Un azul similar al primario
      didDrawPage: function (data) {
        // Footer
        let str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        let pageSize = doc.internal.pageSize;
        let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });
    doc.save(`informe_tickets_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
  };

  const handleExportExcel = () => {
    const worksheetData = filteredTickets.map(ticket => ({
      ID: ticket.id,
      Título: ticket.title,
      Descripción: ticket.description,
      Categoría: ticket.category,
      Prioridad: priorityFilterTranslations[ticket.priority],
      Estado: statusFilterTranslations[ticket.status],
      "Fecha Creación": format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm:ss", { locale: es }),
      "Fecha Actualización": format(new Date(ticket.updatedAt), "yyyy-MM-dd HH:mm:ss", { locale: es }),
      Tags: ticket.tags?.join(', ') || '',
      "Tiempo Registrado (minutos)": ticket.timeLoggedMinutes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    // Ajustar anchos de columna (aproximado)
    const colWidths = [
      { wch: 36 }, // ID
      { wch: 50 }, // Título
      { wch: 70 }, // Descripción
      { wch: 20 }, // Categoría
      { wch: 15 }, // Prioridad
      { wch: 15 }, // Estado
      { wch: 20 }, // Fecha Creación
      { wch: 20 }, // Fecha Actualización
      { wch: 30 }, // Tags
      { wch: 25 }, // Tiempo Registrado
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `informe_tickets_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
  };


  if (!isInitialized) {
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
            No hay tickets registrados en el sistema. Una vez que crees algunos, podrás ver los informes aquí. (Se generarán 20 tickets de ejemplo en la primera carga si no hay datos existentes).
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
          <CardDescription>Ajusta los filtros para refinar los datos mostrados en los gráficos y exportaciones.</CardDescription>
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

      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Exportar Informe</CardTitle>
            <CardDescription>Descarga los datos de los tickets (según filtros aplicados) en formato PDF o Excel.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button onClick={handleExportPDF} variant="outline" disabled={filteredTickets.length === 0}>
                <FileText className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" disabled={filteredTickets.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Descargar Excel
            </Button>
        </CardContent>
      </Card>

      {renderCharts()}
    </div>
  );
};
