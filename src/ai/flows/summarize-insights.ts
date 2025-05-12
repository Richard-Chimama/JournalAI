'use server';

/**
 * @fileOverview Summarizes insights from journal entries.
 *
 * - summarizeInsights - A function that summarizes insights from journal entries.
 * - SummarizeInsightsInput - The input type for the summarizeInsights function.
 * - SummarizeInsightsOutput - The return type for the summarizeInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInsightsInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('A string containing all the journal entries.'),
});
export type SummarizeInsightsInput = z.infer<typeof SummarizeInsightsInputSchema>;

const SummarizeInsightsOutputSchema = z.object({
  insights: z.string().describe('A summary of the insights from the journal entries.'),
});
export type SummarizeInsightsOutput = z.infer<typeof SummarizeInsightsOutputSchema>;

export async function summarizeInsights(input: SummarizeInsightsInput): Promise<SummarizeInsightsOutput> {
  return summarizeInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInsightsPrompt',
  input: {schema: SummarizeInsightsInputSchema},
  output: {schema: SummarizeInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes journal entries and provides summarized insights to the user.

  Analyze the following journal entries and provide a summary of the key patterns, themes, emotions, and potential stressors.

  Journal Entries: {{{journalEntries}}}
  `,
});

const summarizeInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeInsightsFlow',
    inputSchema: SummarizeInsightsInputSchema,
    outputSchema: SummarizeInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
