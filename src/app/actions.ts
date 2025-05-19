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
    return { error: "Description cannot be empty." };
  }
  try {
    const input: CategorizeTicketInput = { ticketContent: description };
    // The AI flow might return priority as a string that needs to be cast to Priority type
    const result = await aiCategorizeTicket(input);
    
    let finalPriority: Priority;
    const aiPriority = result.priority.toLowerCase();
    if (aiPriority === 'low' || aiPriority === 'medium' || aiPriority === 'high') {
      finalPriority = aiPriority as Priority;
    } else {
      // Default or handle unrecognized priority
      console.warn(`AI returned unrecognized priority: ${result.priority}. Defaulting to medium.`);
      finalPriority = 'medium'; 
    }

    return {
      category: result.category,
      priority: finalPriority,
      tags: result.tags,
    };
  } catch (error) {
    console.error("Error categorizing ticket:", error);
    // Check if error is an instance of Error to safely access message
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { error: `Failed to categorize ticket using AI: ${errorMessage}` };
  }
}
