
"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Ticket } from "@/lib/types";

interface LogTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onLogTime: (ticketId: number, durationMinutes: number, notes?: string) => void; // ticketId es number
}

export const LogTimeDialog: FC<LogTimeDialogProps> = ({
  open,
  onOpenChange,
  ticket,
  onLogTime,
}) => {
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!ticket || !duration) return;
    const durationMinutes = parseInt(duration, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      alert("Por favor, ingresa una duración válida en minutos.");
      return;
    }
    onLogTime(ticket.id, durationMinutes, notes); // ticket.id ya es number
    setDuration("");
    setNotes("");
    onOpenChange(false);
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Tiempo para Ticket: #{ticket.id} - {ticket.title}</DialogTitle>
          <DialogDescription>
            Ingresa el tiempo dedicado y cualquier nota relevante para esta tarea.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duración (min)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="col-span-3"
              placeholder="ej: 30"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Notas opcionales sobre el trabajo realizado"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Registrar Tiempo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
