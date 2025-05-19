
"use client";
import type { FC } from 'react';
import type { Ticket } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chartConfigBase = {
  timeLogged: { label: "Tiempo Registrado (horas)", color: "hsl(var(--chart-1))" },
};

type GroupBy = "category" | "priority" | "status";

interface TimeLoggedSummaryChartProps {
  tickets: Ticket[];
  detailed?: boolean;
}

export const TimeLoggedSummaryChart: FC<TimeLoggedSummaryChartProps> = ({ tickets, detailed = false }) => {
  const [groupBy, setGroupBy] = useState<GroupBy>(detailed ? "category" : "category");

  const dataByGroup = tickets.reduce((acc, ticket) => {
    const key = ticket[groupBy];
    if (!acc[key]) {
      acc[key] = { name: key, timeLogged: 0 };
    }
    acc[key].timeLogged += (ticket.timeLoggedMinutes / 60); // Convertir a horas
    return acc;
  }, {} as Record<string, { name: string; timeLogged: number }>);

  const chartData = Object.values(dataByGroup)
    .map(item => ({ ...item, timeLogged: parseFloat(item.timeLogged.toFixed(2))})) // Redondear a 2 decimales
    .filter(item => item.timeLogged > 0)
    .sort((a,b) => b.timeLogged - a.timeLogged); // Ordenar por tiempo descendente

  // Dinámicamente generar chartConfig para las categorías/prioridades/estados
  const dynamicChartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = { 
      label: item.name, 
      color: `hsl(var(--chart-${(index % 5) + 1}))` // Ciclar entre 5 colores de chart
    };
    return acc;
  }, { ...chartConfigBase } as ChartConfig);


  if (chartData.length === 0) {
    return (
      <Card className={detailed ? "col-span-full" : ""}>
        <CardHeader>
          <CardTitle>Resumen de Tiempo Registrado</CardTitle>
          {detailed && <CardDescription>Visualiza el tiempo invertido agrupado por diferentes criterios.</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12" />
            <p className="mt-2">No hay tiempo registrado para mostrar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = detailed ? "400px" : "300px";

  return (
    <Card className={detailed ? "col-span-full" : ""}>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle>Resumen de Tiempo Registrado</CardTitle>
          {detailed && <CardDescription>Visualiza el tiempo invertido agrupado por diferentes criterios.</CardDescription>}
        </div>
        {detailed && (
          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
            <SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Categoría</SelectItem>
              <SelectItem value="priority">Prioridad</SelectItem>
              <SelectItem value="status">Estado</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={dynamicChartConfig} className={`h-[${chartHeight}] w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout={detailed ? "vertical" : "horizontal"} margin={detailed ? { right: 30 } : {top: 20}}>
              <CartesianGrid strokeDasharray="3 3" vertical={detailed} horizontal={!detailed} />
               {detailed ? (
                <>
                  <XAxis type="number" unit="h" />
                  <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} />
                </>
              ) : (
                 <>
                  <XAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                  <YAxis type="number" unit="h" />
                </>
              )}
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" valueFormatter={(value) => `${value}h`} />}
              />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey="timeLogged" name={dynamicChartConfig.timeLogged.label} radius={4}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={dynamicChartConfig[entry.name]?.color || chartConfigBase.timeLogged.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
