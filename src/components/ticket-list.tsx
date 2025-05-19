"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import type { Ticket, Status } from "@/lib/types";
import { useTicketStore } from "@/lib/hooks/use-ticket-store";
import { TicketListItem } from "./ticket-list-item";
import { LogTimeDialog } from "./log-time-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const TicketList: FC = () => {
  const { tickets, logTimeForTicket, updateTicketStatus, isInitialized } = useTicketStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLogTimeDialogOpen, setIsLogTimeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Ticket["priority"] | "all">("all");

  const handleLogTimeClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsLogTimeDialogOpen(true);
  };

  const handleLogTimeSubmit = (ticketId: string, durationMinutes: number, notes?: string) => {
    logTimeForTicket(ticketId, durationMinutes, notes);
    setIsLogTimeDialogOpen(false);
    setSelectedTicket(null);
  };
  
  const filteredTickets = tickets
    .filter(ticket => 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(ticket => filterStatus === "all" || ticket.status === filterStatus)
    .filter(ticket => filterPriority === "all" || ticket.priority === filterPriority);

  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
  
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input 
          placeholder="Search tickets..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Status | "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Ticket["priority"] | "all")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTickets.length === 0 ? (
         <Alert variant="default" className="bg-accent/10 border-accent/30">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle>No Tickets Found</AlertTitle>
          <AlertDescription>
            There are no tickets matching your current filters, or no tickets have been created yet. Try adjusting your search or creating a new ticket.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTickets.map((ticket) => (
            <TicketListItem key={ticket.id} ticket={ticket} onLogTimeClick={handleLogTimeClick} onUpdateStatus={updateTicketStatus} />
          ))}
        </div>
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

// Dummy Card for Skeleton
const Card: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);
const CardContent: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);
const CardFooter: FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>
);

