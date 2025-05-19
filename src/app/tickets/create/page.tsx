import { TicketForm } from "@/components/ticket-form";

export default function CreateTicketPage() {
  return (
    <div className="container mx-auto py-4">
      {/* The Card in TicketForm already provides good padding and structure */}
      <TicketForm />
    </div>
  );
}
