'use server';

/**
 * @fileOverview Generates personalized motivational messages and advice for users based on their daily health data.
 *
 * - generateMotivationalMessage - A function that generates a motivational message.
 * - MotivationalMessageInput - The input type for the generateMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalMessageInputSchema = z.object({
  dailySummary: z
    .string()
    .describe('A summary of the user\'s daily health data and goal attainment.'),
  mood: z.string().describe('The user\'s reported mood for the day.'),
  fatigueLevel: z.number().describe('The user\'s reported fatigue level (1-10).'),
  painLevel: z.number().describe('The user\'s reported joint pain level (1-10).'),
  hydrationCompliance: z
    .string()
    .describe('The user\'s compliance with hydration goals (yes/no/partial).'),
  dietCompliance: z
    .string()
    .describe('The user\'s compliance with diet goals (yes/no/partial).'),
  activityCompliance: z
    .string()
    .describe('The user\'s compliance with activity goals (yes/no/partial).'),
  relaxationCompliance: z
    .string()
    .describe('The user\'s compliance with relaxation goals (yes/no/partial).'),
});
export type MotivationalMessageInput = z.infer<typeof MotivationalMessageInputSchema>;

const MotivationalMessageOutputSchema = z.object({
  message: z
    .string()
    .describe('A personalized motivational message based on the user\'s daily data.'),
});
export type MotivationalMessageOutput = z.infer<typeof MotivationalMessageOutputSchema>;

export async function generateMotivationalMessage(
  input: MotivationalMessageInput
): Promise<MotivationalMessageOutput> {
  return generateMotivationalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: MotivationalMessageInputSchema},
  output: {schema: MotivationalMessageOutputSchema},
  prompt: `You are a supportive and encouraging health coach. Your goal is to provide a short, uplifting, and personalized motivational message based on the user's daily data.

Please follow these instructions to structure your message:
1.  **Acknowledge achievements:** Specifically mention one or two positive things the user accomplished today (e.g., "Great job on drinking all your water!" or "Well done on getting your activity in!").
2.  **Connect to feelings:** Gently link their reported mood, fatigue, or pain to their actions. For example: "I see your fatigue level was high; perhaps taking a few minutes for a relaxation exercise tomorrow could help." or "It's wonderful to see you felt calm after your relaxation exercises."
3.  **Offer a gentle suggestion for improvement:** Based on an area that was missed, offer one simple, encouraging tip for tomorrow. For example: "Every small step counts, maybe just one relaxation exercise tomorrow?"
4.  **Keep it positive and concise:** The message must be warm, non-judgmental, and no more than 50 words.

User's daily data:
Goal Compliance Summary: {{dailySummary}}
Mood: {{mood}}
Fatigue Level: {{fatigueLevel}}
Pain Level: {{painLevel}}
Hydration Compliance: {{hydrationCompliance}}
Diet Compliance: {{dietCompliance}}
Activity Compliance: {{activityCompliance}}
Relaxation Compliance: {{relaxationCompliance}}`,
});

const generateMotivationalMessageFlow = ai.defineFlow(
  {
    name: 'generateMotivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
