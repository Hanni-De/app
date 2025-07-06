'use server';
/**
 * @fileOverview A conversational AI flow for a health coach.
 *
 * - coachChat - A function that handles the conversation.
 * - CoachChatInput - The input type for the coachChat function.
 * - CoachChatOutput - The return type for the coachChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimpleMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const CoachChatInputSchema = z.object({
  history: z.array(SimpleMessageSchema).describe("The conversation history in a simplified format."),
  message: z.string().describe("The user's latest message."),
});
export type CoachChatInput = z.infer<typeof CoachChatInputSchema>;

const CoachChatOutputSchema = z.string().describe("The AI's response.");
export type CoachChatOutput = z.infer<typeof CoachChatOutputSchema>;

export async function coachChat(input: CoachChatInput): Promise<CoachChatOutput> {
  return coachChatFlow(input);
}

const coachChatFlow = ai.defineFlow(
  {
    name: 'coachChatFlow',
    inputSchema: CoachChatInputSchema,
    outputSchema: CoachChatOutputSchema,
  },
  async (input) => {
    // Transform simple history to the format expected by ai.generate
    const history = input.history.map(msg => ({
        role: msg.role,
        content: [{ text: msg.text }]
    }));

    const { output } = await ai.generate({
      system: `You are a friendly, supportive, and empathetic health coach. Your goal is to help the user navigate their health journey.
- Be encouraging and positive.
- Provide helpful, safe, and general health and wellness advice.
- DO NOT provide medical diagnoses or prescribe treatments. Always advise the user to consult a doctor for medical issues.
- Keep your responses concise and easy to understand.
- The user is conversing with you in Hebrew. Respond in Hebrew.
- If the user asks for encouragement, provide a warm and uplifting message.`,
      prompt: input.message,
      history: history,
    });

    return output?.text ?? "מצטערת, לא הצלחתי להבין. אפשר לנסות שוב?";
  }
);
