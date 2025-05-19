
// Este archivo ha sido renombrado a /src/app/reports/page.tsx
// y su contenido ha sido reemplazado por la nueva página de informes.
// Para mantener la funcionalidad original de listar todos los tickets,
// esa funcionalidad ya está presente en /src/app/page.tsx (el dashboard principal).

// Si se desea una página dedicada exclusivamente a "Todos los Tickets" además del dashboard,
// se podría crear un nuevo archivo, por ejemplo, /src/app/all-tickets/page.tsx
// con el siguiente contenido:

/*
import { TicketList } from "@/components/ticket-list";

export default function AllTicketsPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Todos los Tickets de Soporte</h1>
      <TicketList />
    </div>
  );
}
*/

// Por ahora, este archivo se considera obsoleto o reemplazado.
// Dejaremos un comentario para indicar su estado.
// Si se requiere una página específica de "Todos los tickets" separada del dashboard principal,
// se puede crear un nuevo archivo como se sugiere arriba.

export default function TicketsPageObsolete() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold text-center text-muted-foreground p-8">
        Esta página ha sido movida a Informes.
      </h1>
      <p className="text-center text-muted-foreground">
        La lista de todos los tickets ahora se encuentra en el Panel Principal.
      </p>
    </div>
  );
}

