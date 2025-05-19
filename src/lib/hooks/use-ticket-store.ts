"use client";

import type { Ticket, TimeLog, Priority, Status } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

const TICKETS_STORAGE_KEY = "devtrack_tickets";
const TIMELOGS_STORAGE_KEY = "devtrack_timelogs";

function getInitialTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const storedTickets = localStorage.getItem(TICKETS_STORAGE_KEY);
  return storedTickets ? JSON.parse(storedTickets) : [];
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

  const addTicket = useCallback((newTicketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "timeLoggedMinutes"> & { category: string; priority: Priority }) => {
    const newTicket: Ticket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Open",
      timeLoggedMinutes: 0,
    };
    setTickets((prevTickets) => [newTicket, ...prevTickets]);
    return newTicket;
  }, []);

  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  }, [tickets]);
  
  const updateTicketStatus = useCallback((id: string, status: Status) => {
    setTickets(prev => prev.map(t => t.id === id ? {...t, status, updatedAt: new Date().toISOString()} : t));
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
    setTickets(prev => prev.map(t => t.id === ticketId ? {...t, timeLoggedMinutes: t.timeLoggedMinutes + durationMinutes, updatedAt: new Date().toISOString()} : t));
  }, []);

  const getTickets = useCallback(() => tickets, [tickets]);
  
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
