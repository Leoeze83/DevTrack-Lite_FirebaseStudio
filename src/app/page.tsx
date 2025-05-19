
import { TicketList } from "@/components/ticket-list";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Panel de Tickets de Soporte</h1>
      <TicketList />
    </div>
  );
}
