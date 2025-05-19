// use server'

/**
 * @fileOverview An AI agent to categorize support tickets based on content.
 *
 * - categorizeTicket - A function that categorizes a support ticket.
 * - CategorizeTicketInput - The input type for the categorizeTicket function.
 * - CategorizeTicketOutput - The return type for the categorizeTicket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTicketInputSchema = z.object({
  ticketContent: z.string().describe('The content of the support ticket.'),
});
export type CategorizeTicketInput = z.infer<typeof CategorizeTicketInputSchema>;

const CategorizeTicketOutputSchema = z.object({
  tags: z.array(z.string()).describe('Tags associated with the ticket.'),
  category: z.string().describe('The category of the ticket.'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority of the ticket.'),
});
export type CategorizeTicketOutput = z.infer<typeof CategorizeTicketOutputSchema>;

export async function categorizeTicket(input: CategorizeTicketInput): Promise<CategorizeTicketOutput> {
  return categorizeTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTicketPrompt',
  input: {schema: CategorizeTicketInputSchema},
  output: {schema: CategorizeTicketOutputSchema},
  prompt: `You are an expert support ticket triage agent.

  Analyze the content of the support ticket to automatically tag, categorize, and assign priority using keyword recognition.

  The priority should be low, medium, or high.

  Content: {{{ticketContent}}}
  `,
});

const categorizeTicketFlow = ai.defineFlow(
  {
    name: 'categorizeTicketFlow',
    inputSchema: CategorizeTicketInputSchema,
    outputSchema: CategorizeTicketOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
