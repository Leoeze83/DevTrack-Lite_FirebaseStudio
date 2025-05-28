
"use client";

import type { FC } from "react";
import { useState, useEffect } from "react"; // Import useEffect
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
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface LogTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onLogTime: (ticketId: number, durationMinutes: number, notes?: string) => void;
}

export const LogTimeDialog: FC<LogTimeDialogProps> = ({
  open,
  onOpenChange,
  ticket,
  onLogTime,
}) => {
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Reset form when dialog opens or ticket changes, only if mounted
    if (open && ticket) {
      setDuration("");
      setNotes("");
    }
  }, [open, ticket]);


  const handleSubmit = () => {
    if (!ticket || !duration) return;
    const durationMinutes = parseInt(duration, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      // Consider using toast for user feedback instead of alert
      alert("Por favor, ingresa una duración válida en minutos.");
      return;
    }
    onLogTime(ticket.id, durationMinutes, notes);
    // No es necesario resetear aquí si se hace en el useEffect de 'open'
    onOpenChange(false);
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!isMounted ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-3/4" /> {/* Placeholder for Title */}
            <Skeleton className="h-4 w-full" /> {/* Placeholder for Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Skeleton className="h-6 w-full col-start-2 col-span-3" /> {/* Placeholder for Label */}
              <Skeleton className="h-10 w-full col-span-3 col-start-2" /> {/* Placeholder for Input */}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Skeleton className="h-6 w-full col-start-2 col-span-3" /> {/* Placeholder for Label */}
              <Skeleton className="h-20 w-full col-span-3 col-start-2" /> {/* Placeholder for Textarea */}
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Registrar Tiempo para: #{ticket.id} - {ticket.title}</DialogTitle>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
