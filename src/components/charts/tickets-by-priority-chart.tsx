
"use client";
import type { FC } from 'react';
import type { Ticket, Priority } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AlertCircle } from 'lucide-react';

const priorityTranslations: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const chartConfig = {
  tickets: { label: "Tickets" },
  low: { label: priorityTranslations["low"], color: "hsl(var(--chart-1))" },
  medium: { label: priorityTranslations["medium"], color: "hsl(var(--chart-2))" },
  high: { label: priorityTranslations["high"], color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;


interface TicketsByPriorityChartProps {
  tickets: Ticket[];
  detailed?: boolean;
}

export const TicketsByPriorityChart: FC<TicketsByPriorityChartProps> = ({ tickets, detailed = false }) => {
  const priorityCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
    return acc;
  }, {} as Record<Priority, number>);

  const chartData = (Object.keys(priorityCounts) as Priority[])
    .map(priority => ({
      name: priority, // Usamos el nombre original para el dataKey
      label: chartConfig[priority]?.label || priority, // Usamos la traducción para mostrar
      value: priorityCounts[priority],
      fill: chartConfig[priority]?.color || "hsl(var(--muted))",
    }))
    .filter(item => item.value > 0)
    .sort((a,b) => { // Ordenar por un orden lógico de prioridad
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return order[a.name as Priority] - order[b.name as Priority];
    });

  if (chartData.length === 0) {
     return (
      <Card className={detailed ? "col-span-full" : ""}>
        <CardHeader>
          <CardTitle>Tickets por Prioridad</CardTitle>
          {detailed && <CardDescription>Distribución detallada de tickets según su prioridad.</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12" />
            <p className="mt-2">No hay datos de tickets para mostrar según los filtros actuales.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chartHeight = detailed ? "400px" : "300px";

  return (
    <Card className={detailed ? "col-span-full" : ""}>
      <CardHeader>
        <CardTitle>Tickets por Prioridad</CardTitle>
        {detailed && <CardDescription>Distribución detallada de tickets según su prioridad.</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={`h-[${chartHeight}] w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout={detailed ? "vertical" : "horizontal"} margin={detailed ? { right: 30 } : {top: 20}}>
              <CartesianGrid strokeDasharray="3 3" vertical={detailed} horizontal={!detailed} />
              {detailed ? (
                <>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="label" type="category" width={80} tickLine={false} axisLine={false} />
                </>
              ) : (
                 <>
                  <XAxis dataKey="label" type="category" tickLine={false} axisLine={false} />
                  <YAxis type="number" allowDecimals={false} />
                </>
              )}
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="value" name="Tickets" radius={4}>
                 {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
