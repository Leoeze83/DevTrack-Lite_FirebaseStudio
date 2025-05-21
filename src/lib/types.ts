
export type Priority = "low" | "medium" | "high";
export type Status = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";

export interface Ticket {
  id: number; // Cambiado de string a number
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  tags?: string[];
  timeLoggedMinutes: number; // Total time logged in minutes
}

export interface TimeLog {
  id: string; // Puede seguir siendo UUID para los logs
  ticketId: number; // Cambiado de string a number para coincidir con Ticket.id
  userId: string; // For now, can be a placeholder like "dev_user"
  durationMinutes: number;
  notes?: string;
  loggedAt: string; // ISO string
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO string
  // Podríamos añadir 'updatedAt', 'role', etc. en el futuro
}
