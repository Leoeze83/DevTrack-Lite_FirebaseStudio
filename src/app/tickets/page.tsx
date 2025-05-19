
import { TicketList } from "@/components/ticket-list";

export default function AllTicketsPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Todos los Tickets de Soporte</h1>
      <TicketList />
    </div>
  );
}
