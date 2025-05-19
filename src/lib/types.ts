export type Priority = "low" | "medium" | "high";
export type Status = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";

export interface Ticket {
  id: string;
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
  ticketId: string;
  userId: string; // For now, can be a placeholder like "dev_user"
  durationMinutes: number;
  notes?: string;
  loggedAt: string; // ISO string
}
