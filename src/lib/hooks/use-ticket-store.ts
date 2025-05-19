
"use client";

import type { Ticket, TimeLog, Priority, Status } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

const TICKETS_STORAGE_KEY = "devtrack_tickets";
const TIMELOGS_STORAGE_KEY = "devtrack_timelogs";

const sampleTitles = [
  "Error de inicio de sesión en la app móvil", "Mejora de UI para el dashboard de admin",
  "Fallo al exportar reporte de usuarios", "Necesidad de nuevo filtro en la lista de productos",
  "El botón de 'Guardar' no responde en el formulario X", "Optimizar la carga de imágenes en la galería",
  "Problema de compatibilidad con navegador Firefox", "Añadir paginación a la tabla de pedidos",
  "Error 500 al procesar pago", "Diseñar nuevo flujo de onboarding para usuarios",
  "Actualizar dependencias de seguridad", "Investigar lentitud en API de clientes",
  "La notificación push no llega a dispositivos iOS", "Cambiar colores del tema principal",
  "Implementar búsqueda avanzada en catálogo", "Corregir error de cálculo en módulo de facturación",
  "Testear nueva funcionalidad de chat en vivo", "El video de introducción no se reproduce",
  "Añadir validación de campos en perfil de usuario", "Traducir la aplicación al francés"
];

const sampleDescriptions = [
  "Los usuarios reportan que no pueden iniciar sesión desde la última actualización.",
  "El dashboard de administración necesita un rediseño para ser más intuitivo.",
  "Al intentar exportar el reporte de usuarios en formato CSV, se genera un archivo vacío.",
  "Se requiere un filtro por 'fecha de creación' en la lista de productos.",
  "El formulario X tiene un problema donde el botón de guardar está deshabilitado o no reacciona.",
  "Las imágenes en la galería principal tardan mucho en cargar, afectando la experiencia.",
  "Algunos elementos de la interfaz no se visualizan correctamente en Firefox.",
  "La tabla de pedidos muestra demasiados registros a la vez, necesita paginación.",
  "Al intentar finalizar una compra, algunos usuarios reciben un error HTTP 500.",
  "Proponer y diseñar un flujo de bienvenida más amigable para los nuevos usuarios.",
  "Hay varias dependencias con vulnerabilidades conocidas que necesitan ser actualizadas.",
  "La API que devuelve la lista de clientes está respondiendo muy lento últimamente.",
  "Las notificaciones push no están siendo recibidas por usuarios con dispositivos iOS.",
  "Se solicita un cambio en la paleta de colores primarios y secundarios del tema.",
  "Implementar una función de búsqueda que permita filtrar por múltiples criterios en el catálogo.",
  "El módulo de facturación está calculando incorrectamente los impuestos en ciertos casos.",
  "Es necesario realizar pruebas exhaustivas de la nueva funcionalidad de chat.",
  "El video promocional en la página de inicio no se reproduce en algunos navegadores.",
  "Faltan validaciones en el lado del cliente para los campos del perfil de usuario.",
  "Se necesita la traducción completa de la interfaz de usuario al idioma francés."
];

const sampleCategories = ["Bug", "Mejora", "Funcionalidad Nueva", "Soporte Técnico", "Diseño UI/UX", "Rendimiento", "Seguridad"];
const samplePriorities: Priority[] = ["low", "medium", "high"];
const sampleStatuses: Status[] = ["Open", "In Progress", "Pending", "Resolved", "Closed"];
const sampleTags = [["login", "mobile"], ["ui", "admin"], ["export", "csv"], ["filter", "product"], ["form", "bug"], ["performance", "images"], ["browser", "firefox"], ["pagination", "orders"], ["payment", "error"], ["design", "ux"], ["security", "update"], ["api", "performance"], ["push", "ios"], ["design", "theme"], ["search", "catalog"], ["billing", "bug"], ["testing", "chat"], ["video", "bug"], ["validation", "profile"], ["translation", "i18n"]];

function generateRandomTicket(index: number): Ticket {
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
  const status = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];
  let updatedAt = createdAt;
  if (Math.random() > 0.5) {
    updatedAt = new Date(new Date(createdAt).getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString();
  }
  const timeLoggedMinutes = status === "Closed" || status === "Resolved" ? Math.floor(Math.random() * 300) : Math.floor(Math.random() * 60);

  return {
    id: crypto.randomUUID(),
    title: sampleTitles[index % sampleTitles.length] + (Math.random() > 0.7 ? ` (v${index})` : ""),
    description: sampleDescriptions[index % sampleDescriptions.length],
    category: sampleCategories[Math.floor(Math.random() * sampleCategories.length)],
    priority: samplePriorities[Math.floor(Math.random() * samplePriorities.length)],
    status: status,
    createdAt: createdAt,
    updatedAt: updatedAt,
    tags: Math.random() > 0.5 ? sampleTags[index % sampleTags.length] : undefined,
    timeLoggedMinutes: timeLoggedMinutes,
  };
}


function getInitialTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const storedTickets = localStorage.getItem(TICKETS_STORAGE_KEY);
  if (storedTickets) {
    return JSON.parse(storedTickets);
  }
  // Si no hay tickets, generamos 20 de ejemplo
  const exampleTickets = Array.from({ length: 20 }, (_, i) => generateRandomTicket(i));
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(exampleTickets));
  return exampleTickets;
}

function getInitialTimeLogs(): TimeLog[] {
  if (typeof window === "undefined") return [];
  const storedTimeLogs = localStorage.getItem(TIMELOGS_STORAGE_KEY);
  // Podríamos generar time logs de ejemplo aquí también si quisiéramos
  return storedTimeLogs ? JSON.parse(storedTimeLogs) : [];
}

export function useTicketStore() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setTickets(getInitialTickets());
    setTimeLogs(getInitialTimeLogs());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    }
  }, [tickets, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(TIMELOGS_STORAGE_KEY, JSON.stringify(timeLogs));
    }
  }, [timeLogs, isInitialized]);

  const addTicket = useCallback((newTicketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "timeLoggedMinutes"> & { category: string; priority: Priority }) => {
    const newTicket: Ticket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Open",
      timeLoggedMinutes: 0,
    };
    setTickets((prevTickets) => [newTicket, ...prevTickets].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    return newTicket;
  }, []);

  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  }, [tickets]);
  
  const updateTicketStatus = useCallback((id: string, status: Status) => {
    setTickets(prev => prev.map(t => t.id === id ? {...t, status, updatedAt: new Date().toISOString()} : t).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const logTimeForTicket = useCallback((ticketId: string, durationMinutes: number, notes?: string) => {
    const newTimeLog: TimeLog = {
      id: crypto.randomUUID(),
      ticketId,
      userId: "dev_user", // Placeholder
      durationMinutes,
      notes,
      loggedAt: new Date().toISOString(),
    };
    setTimeLogs(prev => [...prev, newTimeLog]);
    setTickets(prev => prev.map(t => t.id === ticketId ? {...t, timeLoggedMinutes: t.timeLoggedMinutes + durationMinutes, updatedAt: new Date().toISOString()} : t).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const getTickets = useCallback(() => tickets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [tickets]);
  
  const getTimeLogsForTicket = useCallback((ticketId: string) => {
    return timeLogs.filter(log => log.ticketId === ticketId);
  }, [timeLogs]);


  return {
    tickets,
    addTicket,
    getTicketById,
    updateTicketStatus,
    logTimeForTicket,
    getTickets,
    getTimeLogsForTicket,
    isInitialized
  };
}
