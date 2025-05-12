'use server';

/**
 * @fileOverview An AI agent that analyzes journal entries to identify recurring themes, emotions, and potential stressors.
 *
 * - analyzeJournalEntries - A function that handles the analysis of journal entries.
 * - AnalyzeJournalEntriesInput - The input type for the analyzeJournalEntries function.
 * - AnalyzeJournalEntriesOutput - The return type for the analyzeJournalEntries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJournalEntriesInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('A collection of journal entries, separated by newlines.'),
});
export type AnalyzeJournalEntriesInput = z.infer<typeof AnalyzeJournalEntriesInputSchema>;

const AnalyzeJournalEntriesOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('A list of recurring themes found in the journal entries.'),
  emotions: z
    .array(z.string())
    .describe('A list of emotions expressed in the journal entries.'),
  stressors: z
    .array(z.string())
    .describe('A list of potential stressors identified in the journal entries.'),
  summary: z.string().describe('A summary of the insights gained from the journal entries.'),
  recommendations: z
    .string()
    .describe('Recommended actions based on the identified themes, emotions, and stressors.'),
});
export type AnalyzeJournalEntriesOutput = z.infer<typeof AnalyzeJournalEntriesOutputSchema>;

export async function analyzeJournalEntries(
  input: AnalyzeJournalEntriesInput
): Promise<AnalyzeJournalEntriesOutput> {
  return analyzeJournalEntriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJournalEntriesPrompt',
  input: {schema: AnalyzeJournalEntriesInputSchema},
  output: {schema: AnalyzeJournalEntriesOutputSchema},
  prompt: `You are an AI assistant designed to analyze journal entries and provide insights into the user's mental state and behaviors.

  Analyze the following journal entries to identify recurring themes, emotions, and potential stressors. Provide a summary of your findings and recommend actions based on your analysis.

  Journal Entries:
  {{journalEntries}}

  Output your findings as a JSON object with the following keys:
  - themes: A list of recurring themes found in the journal entries.
  - emotions: A list of emotions expressed in the journal entries.
  - stressors: A list of potential stressors identified in the journal entries.
  - summary: A summary of the insights gained from the journal entries.
  - recommendations: Recommended actions based on the identified themes, emotions, and stressors.`,
});

const analyzeJournalEntriesFlow = ai.defineFlow(
  {
    name: 'analyzeJournalEntriesFlow',
    inputSchema: AnalyzeJournalEntriesInputSchema,
    outputSchema: AnalyzeJournalEntriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
