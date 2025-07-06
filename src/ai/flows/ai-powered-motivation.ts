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
  prompt: `You are a supportive and encouraging health coach. Based on the user's daily summary and reported data, provide a short, uplifting, and personalized motivational message to encourage them on their health journey.

Here is the user's daily summary:
{{dailySummary}}

Here is the user's reported data:
Mood: {{mood}}
Fatigue Level: {{fatigueLevel}}
Pain Level: {{painLevel}}
Hydration Compliance: {{hydrationCompliance}}
Diet Compliance: {{dietCompliance}}
Activity Compliance: {{activityCompliance}}
Relaxation Compliance: {{relaxationCompliance}}

Write a message that is no more than 50 words.`,
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
