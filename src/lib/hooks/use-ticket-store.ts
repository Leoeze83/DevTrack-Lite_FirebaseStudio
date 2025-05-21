
"use client";

import type { Ticket, TimeLog, Priority, Status } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

const TICKETS_STORAGE_KEY = "devtrack_tickets_v2"; // Cambiada la clave para forzar reinicio si hay datos viejos con UUID
const TIMELOGS_STORAGE_KEY = "devtrack_timelogs_v2";

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

const sampleCategories = ["Bug", "Mejora", "Funcionalidad Nueva", "Soporte Técnico", "Diseño UI/UX", "Rendimiento", "Seguridad", "Despliegue", "Base de Datos"];
const samplePriorities: Priority[] = ["low", "medium", "high"];
const sampleStatuses: Status[] = ["Open", "In Progress", "Pending", "Resolved", "Closed"];
const sampleTags = [
    ["login", "mobile", "auth"], ["ui", "admin", "dashboard"], ["export", "csv", "report"], ["filter", "product", "backend"], 
    ["form", "bug", "validation"], ["performance", "images", "frontend"], ["browser", "firefox", "css"], ["pagination", "orders", "list"],
    ["payment", "error", "stripe"], ["design", "ux", "onboarding"], ["security", "update", "vulnerability"], ["api", "performance", "database"], 
    ["push", "ios", "notification"], ["design", "theme", "colors"], ["search", "catalog", "elasticsearch"], ["billing", "bug", "calculation"], 
    ["testing", "chat", "qa"], ["video", "bug", "multimedia"], ["validation", "profile", "frontend"], ["translation", "i18n", "localization"]
];


function generateRandomTicket(index: number): Ticket {
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
  const statusOptions = sampleStatuses;
  const currentStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  
  let updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * (Date.now() - createdAt.getTime())) );
  if (updatedAt < createdAt) updatedAt = createdAt; 

  const timeLoggedMinutes = (currentStatus === "Resolved" || currentStatus === "Closed") 
    ? Math.floor(Math.random() * 240) + 60 
    : (currentStatus === "In Progress" ? Math.floor(Math.random() * 120) : Math.floor(Math.random()*30)); 

  return {
    id: index + 1, // ID numérico secuencial para ejemplos
    title: sampleTitles[index % sampleTitles.length] + (Math.random() > 0.8 ? ` - Incidencia #${Math.floor(Math.random()*1000)}` : ""),
    description: sampleDescriptions[index % sampleDescriptions.length] + (Math.random() > 0.5 ? " Se necesita atención urgente." : " Por favor, revisar cuando sea posible."),
    category: sampleCategories[index % sampleCategories.length],
    priority: samplePriorities[index % samplePriorities.length],
    status: currentStatus,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    tags: Math.random() > 0.3 ? sampleTags[index % sampleTags.length].slice(0, Math.floor(Math.random() * sampleTags[index % sampleTags.length].length) + 1) : undefined,
    timeLoggedMinutes: timeLoggedMinutes,
  };
}

function getInitialTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  
  const storedTicketsString = localStorage.getItem(TICKETS_STORAGE_KEY);
  let ticketsFromStorage: Ticket[] = [];

  if (storedTicketsString) {
    try {
      const parsed = JSON.parse(storedTicketsString);
      if (Array.isArray(parsed)) {
        // Validación para IDs numéricos
        if (parsed.every(t => typeof t === 'object' && t !== null && 'id' in t && typeof t.id === 'number' && 'title' in t)) {
            ticketsFromStorage = parsed;
        } else if (parsed.length > 0) { 
            console.warn("Los datos de tickets almacenados no tienen IDs numéricos o no son válidos. Se regenerarán.");
            localStorage.removeItem(TICKETS_STORAGE_KEY);
        }
      } else {
        console.warn("Los datos de tickets almacenados no eran un array. Descartando.");
        localStorage.removeItem(TICKETS_STORAGE_KEY); 
      }
    } catch (e) {
      console.error("Error al parsear tickets desde localStorage. Descartando.", e);
      localStorage.removeItem(TICKETS_STORAGE_KEY); 
    }
  }

  if (ticketsFromStorage.length === 0) {
    const exampleTickets = Array.from({ length: 10 }, (_, i) => generateRandomTicket(i));
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(exampleTickets));
    return exampleTickets.sort((a,b) => b.id - a.id); // Ordenar por ID descendente (más nuevo primero)
  }

  return ticketsFromStorage.sort((a,b) => b.id - a.id); // Ordenar por ID descendente
}

function getInitialTimeLogs(): TimeLog[] {
  if (typeof window === "undefined") return [];
  const storedTimeLogs = localStorage.getItem(TIMELOGS_STORAGE_KEY);
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

  const getNextId = useCallback(() => {
    if (tickets.length === 0) {
      return 1;
    }
    return Math.max(...tickets.map(t => t.id)) + 1;
  }, [tickets]);

  const addTicket = useCallback((newTicketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "timeLoggedMinutes"> & { category: string; priority: Priority }) => {
    const newTicket: Ticket = {
      ...newTicketData,
      id: getNextId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Open",
      timeLoggedMinutes: 0,
    };
    setTickets((prevTickets) => [newTicket, ...prevTickets].sort((a,b) => b.id - a.id));
    return newTicket;
  }, [getNextId]);
  
  const updateTicket = useCallback((id: number, dataToUpdate: Partial<Omit<Ticket, "id" | "createdAt" | "timeLoggedMinutes">>) => {
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...dataToUpdate, updatedAt: new Date().toISOString() } 
        : t
    ).sort((a,b) => b.id - a.id));
    // Podríamos devolver el ticket actualizado si es necesario
    return tickets.find(t => t.id === id);
  }, [tickets]);

  const getTicketById = useCallback((id: number): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  }, [tickets]);
  
  const updateTicketStatus = useCallback((id: number, status: Status) => {
    setTickets(prev => prev.map(t => t.id === id ? {...t, status, updatedAt: new Date().toISOString()} : t).sort((a,b) => b.id - a.id));
  }, []);

  const logTimeForTicket = useCallback((ticketId: number, durationMinutes: number, notes?: string) => {
    const newTimeLog: TimeLog = {
      id: crypto.randomUUID(),
      ticketId,
      userId: "dev_user", 
      durationMinutes,
      notes,
      loggedAt: new Date().toISOString(),
    };
    setTimeLogs(prev => [...prev, newTimeLog]);
    setTickets(prev => prev.map(t => t.id === ticketId ? {...t, timeLoggedMinutes: t.timeLoggedMinutes + durationMinutes, updatedAt: new Date().toISOString()} : t).sort((a,b) => b.id - a.id));
  }, []);

  const getTickets = useCallback(() => tickets.sort((a,b) => b.id - a.id), [tickets]);
  
  const getTimeLogsForTicket = useCallback((ticketId: number) => {
    return timeLogs.filter(log => log.ticketId === ticketId);
  }, [timeLogs]);


  return {
    tickets,
    addTicket,
    getTicketById,
    updateTicket,
    updateTicketStatus,
    logTimeForTicket,
    getTickets,
    getTimeLogsForTicket,
    isInitialized
  };
}
