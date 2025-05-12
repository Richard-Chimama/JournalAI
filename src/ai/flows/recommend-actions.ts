// src/ai/flows/recommend-actions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending actions
 * based on identified themes and emotions in a user's journal entries.
 *
 * - recommendActions - A function that takes journal insights as input and
 *   returns recommended actions.
 * - RecommendActionsInput - The input type for the recommendActions function.
 * - RecommendActionsOutput - The return type for the recommendActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendActionsInputSchema = z.object({
  themes: z.string().describe('Recurring themes identified in journal entries.'),
  emotions: z.string().describe('Emotions expressed in journal entries.'),
});
export type RecommendActionsInput = z.infer<typeof RecommendActionsInputSchema>;

const RecommendActionsOutputSchema = z.object({
  actions: z.string().describe('Recommended actions to address stressors and improve well-being.'),
});
export type RecommendActionsOutput = z.infer<typeof RecommendActionsOutputSchema>;

export async function recommendActions(input: RecommendActionsInput): Promise<RecommendActionsOutput> {
  return recommendActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendActionsPrompt',
  input: {schema: RecommendActionsInputSchema},
  output: {schema: RecommendActionsOutputSchema},
  prompt: `Based on the identified themes and emotions in the user's journal entries, recommend specific actions the user can take to address potential stressors and improve their well-being.

Themes: {{{themes}}}
Emotions: {{{emotions}}}

Recommended Actions:`,
});

const recommendActionsFlow = ai.defineFlow(
  {
    name: 'recommendActionsFlow',
    inputSchema: RecommendActionsInputSchema,
    outputSchema: RecommendActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
