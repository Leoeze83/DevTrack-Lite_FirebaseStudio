
import { ReportsDashboard } from "@/components/reports-dashboard";

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Informes de Tickets</h1>
        <p className="text-muted-foreground">
          Visualiza métricas y tendencias clave de tus tickets de soporte.
        </p>
      </div>
      <ReportsDashboard />
    </div>
  );
}
