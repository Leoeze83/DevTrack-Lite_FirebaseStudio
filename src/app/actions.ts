
"use server";

import { categorizeTicket as aiCategorizeTicket, CategorizeTicketInput } from "@/ai/flows/categorize-ticket";
import type { Priority } from "@/lib/types";

export interface CategorizationResult {
  category: string;
  priority: Priority;
  tags?: string[];
}

export async function categorizeTicketDescription(description: string): Promise<CategorizationResult | { error: string }> {
  if (!description || !description.trim()) {
    return { error: "La descripción no puede estar vacía." };
  }
  try {
    const input: CategorizeTicketInput = { ticketContent: description };
    const result = await aiCategorizeTicket(input);
    
    let finalPriority: Priority;
    const aiPriority = result.priority.toLowerCase();
    if (aiPriority === 'low' || aiPriority === 'medium' || aiPriority === 'high') {
      finalPriority = aiPriority as Priority;
    } else {
      console.warn(`La IA devolvió una prioridad no reconocida: ${result.priority}. Se usará 'media' por defecto.`);
      finalPriority = 'medium'; 
    }

    return {
      category: result.category,
      priority: finalPriority,
      tags: result.tags,
    };
  } catch (error) {
    console.error("Error categorizing ticket:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido";
    return { error: `Error al categorizar el ticket usando IA: ${errorMessage}` };
  }
}
