
export type Priority = "low" | "medium" | "high";
export type Status = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";

export interface Ticket {
  id: number; 
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
  id: string; 
  ticketId: number; 
  userId: string; 
  durationMinutes: number;
  notes?: string;
  loggedAt: string; // ISO string
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Contraseña (simulada, sin hashing para prototipo)
  avatarUrl?: string; // Opcional
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string - Añadido para consistencia
}

// Para el store de autenticación
export interface CurrentUser extends Omit<User, 'password'> { // No exponer la contraseña en currentUser
  // Podemos añadir roles u otra info específica de la sesión aquí en el futuro
}

