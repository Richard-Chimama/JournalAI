
'use server';

/**
 * @fileOverview An AI agent that analyzes journal entries (text and audio) to identify recurring themes, emotions, and potential stressors.
 *
 * - analyzeJournalEntries - A function that handles the analysis of journal entries.
 * - AnalyzeJournalEntriesInput - The input type for the analyzeJournalEntries function.
 * - AnalyzeJournalEntriesOutput - The return type for the analyzeJournalEntries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Mood } from '@/lib/types'; // Assuming Mood type is defined here or accessible

const JournalEntryForAISchema = z.object({
  date: z.string().describe("The date of the journal entry in ISO format."),
  mood: z.string().optional().describe("The mood recorded for the entry (e.g., great, good, okay, bad, terrible)."),
  text: z.string().describe("The textual content of the journal entry."),
  voiceNoteDataUri: z.string().optional().describe("A voice note for the entry, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const AnalyzeJournalEntriesInputSchema = z.object({
  journalEntries: z.array(JournalEntryForAISchema)
    .describe('An array of journal entries to be analyzed. Each entry includes date, optional mood, text, and an optional voice note data URI.'),
});
export type AnalyzeJournalEntriesInput = z.infer<typeof AnalyzeJournalEntriesInputSchema>;

const AnalyzeJournalEntriesOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('A list of recurring themes found across all journal entries.'),
  emotions: z
    .array(z.string())
    .describe('A list of emotions expressed across all journal entries.'),
  stressors: z
    .array(z.string())
    .describe('A list of potential stressors identified across all journal entries.'),
  summary: z.string().describe('A comprehensive summary of the insights gained from all journal entries (text and audio).'),
  recommendations: z
    .string()
    .describe('Recommended actions based on the identified themes, emotions, and stressors from all entries.'),
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
  prompt: `You are an AI assistant designed to analyze a series of journal entries and provide insights into the user's mental state and behaviors.
The user may provide text entries and accompanying voice notes. Consider both modalities when analyzing.

Analyze the following journal entries:
{{#each journalEntries}}
Journal Entry:
Date: {{this.date}}
{{#if this.mood}}Mood: {{this.mood}}{{else}}Mood: Not specified{{/if}}
Text:
{{{this.text}}}
{{#if this.voiceNoteDataUri}}
Voice Note (listen for tone, emphasis, and content not captured in text):
{{media url=this.voiceNoteDataUri}}
{{/if}}
--- End of Entry ---
{{/each}}

Based on ALL the provided entries (text and audio), identify overall recurring themes, expressed emotions, and potential stressors.
Provide a consolidated summary of your findings and recommend holistic actions based on your complete analysis.

Output your findings as a JSON object with the following keys:
- themes: A list of recurring themes found across all journal entries.
- emotions: A list of emotions expressed across all journal entries.
- stressors: A list of potential stressors identified across all journal entries.
- summary: A comprehensive summary of the insights gained from all journal entries (text and audio).
- recommendations: Recommended actions based on the identified themes, emotions, and stressors from all entries.`,
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

