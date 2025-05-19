
"use client";
import type { FC } from 'react';
import type { Ticket } from '@/lib/types';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, parseISO, startOfWeek, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const chartConfig = {
  tickets: { label: "Tickets Creados", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

type GroupByType = "day" | "week" | "month";

interface TicketsCreatedOverTimeChartProps {
  tickets: Ticket[];
  detailed?: boolean;
}

export const TicketsCreatedOverTimeChart: FC<TicketsCreatedOverTimeChartProps> = ({ tickets, detailed = false }) => {
  const [groupBy, setGroupBy] = useState<GroupByType>(detailed ? "day" : "week");

  const
 
processedData = tickets.reduce((acc, ticket) => {
    const date = parseISO(ticket.createdAt);
    let key: string;
    switch (groupBy) {
      case "week":
        key = format(startOfWeek(date, { locale: es }), "dd MMM yyyy", { locale: es });
        break;
      case "month":
        key = format(startOfMonth(date), "MMM yyyy", { locale: es });
        break;
      case "day":
      default:
        key = format(date, "dd MMM yyyy", { locale: es });
        break;
    }
    if (!acc[key]) {
      acc[key] = { date: key, tickets: 0 };
    }
    acc[key].tickets += 1;
    return acc;
  }, {} as Record<string, { date: string; tickets: number }>);

  const chartData = Object.values(processedData).sort((a,b) => {
    // Necesitamos convertir las fechas de nuevo para ordenar correctamente
    const dateA = parseISO(a.date.split(" ").reverse().join("-")); // Asume formato dd MMM yyyy
    const dateB = parseISO(b.date.split(" ").reverse().join("-"));
    // Simplificando, puede necesitar ajuste si el formato de 'key' cambia mucho
    // Para formatos como "MMM yyyy" o "dd MMM yyyy", una simple comparación de strings puede no ser suficiente
    // idealmente convertir de nuevo a objeto Date para comparar fechas.
    // Esta es una aproximación, puede ser necesario un parseo más robusto de las 'keys' a fechas.
    let d1, d2;
    try { d1 = parseISO(a.date); } catch(e) { d1 = new Date(a.date.replace(/(\d{2}) (\w{3}) (\d{4})/, '$2 $1 $3'));} //Intenta parsear 'dd Mmm yyyy'
    try { d2 = parseISO(b.date); } catch(e) { d2 = new Date(b.date.replace(/(\d{2}) (\w{3}) (\d{4})/, '$2 $1 $3'));}
    
    return d1.getTime() - d2.getTime();
  });


  if (chartData.length === 0) {
    return (
      <Card className={detailed ? "col-span-full" : ""}>
        <CardHeader>
          <CardTitle>Tendencia de Creación de Tickets</CardTitle>
          {detailed && <CardDescription>Visualiza la creación de tickets a lo largo del tiempo.</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12" />
            <p className="mt-2">No hay datos para mostrar la tendencia de creación.</p>
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
          <CardTitle>Tendencia de Creación de Tickets</CardTitle>
          {detailed && <CardDescription>Visualiza la creación de tickets a lo largo del tiempo.</CardDescription>}
        </div>
        {detailed && (
          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupByType)}>
            <SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Día</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={`h-[${chartHeight}] w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: detailed ? 20 : 10, left: detailed ? -10 : -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                // tickFormatter={(value) => format(parseISO(value), "dd/MM", { locale: es })} // Ajustar si la key no es ISO
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="tickets" stroke={chartConfig.tickets.color} strokeWidth={2} dot={detailed} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
