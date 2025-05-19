
"use client";
import type { FC } from 'react';
import type { Ticket, Status } from '@/lib/types';
import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AlertCircle } from 'lucide-react';

const statusTranslations: Record<Status, string> = {
  Open: "Abierto",
  "In Progress": "En Progreso",
  Pending: "Pendiente",
  Resolved: "Resuelto",
  Closed: "Cerrado",
};

const chartConfig = {
  tickets: { label: "Tickets" },
  Open: { label: statusTranslations["Open"], color: "hsl(var(--chart-1))" },
  "In Progress": { label: statusTranslations["In Progress"], color: "hsl(var(--chart-2))" },
  Pending: { label: statusTranslations["Pending"], color: "hsl(var(--chart-3))" },
  Resolved: { label: statusTranslations["Resolved"], color: "hsl(var(--chart-4))" },
  Closed: { label: statusTranslations["Closed"], color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

interface TicketsByStatusChartProps {
  tickets: Ticket[];
  detailed?: boolean;
}

export const TicketsByStatusChart: FC<TicketsByStatusChartProps> = ({ tickets, detailed = false }) => {
  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const chartData = (Object.keys(statusCounts) as Status[])
    .map(status => ({
      name: status, // Usamos el nombre original para el dataKey
      label: chartConfig[status]?.label || status, // Usamos la traducción para mostrar
      value: statusCounts[status],
      fill: chartConfig[status]?.color || "hsl(var(--muted))",
    }))
    .filter(item => item.value > 0);
    
  if (chartData.length === 0) {
    return (
      <Card className={detailed ? "col-span-full" : ""}>
        <CardHeader>
          <CardTitle>Tickets por Estado</CardTitle>
          {detailed && <CardDescription>Distribución detallada de tickets según su estado actual.</CardDescription>}
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
        <CardTitle>Tickets por Estado</CardTitle>
        {detailed && <CardDescription>Distribución detallada de tickets según su estado actual.</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={`h-[${chartHeight}] w-full`}>
          {detailed ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="label" type="category" width={100} tickLine={false} axisLine={false} />
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
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label" // Usamos la etiqueta traducida para el Pie
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180
                    const radius = 25 + innerRadius + (outerRadius - innerRadius)
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="hsl(var(--foreground))"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        className="text-xs fill-muted-foreground"
                      >
                        {chartData[index].label} ({value})
                      </text>
                    )
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
