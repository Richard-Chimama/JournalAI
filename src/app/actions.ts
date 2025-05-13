
"use server";

import { analyzeJournalEntries, type AnalyzeJournalEntriesInput, type AnalyzeJournalEntriesOutput } from "@/ai/flows/analyze-journal-entries";
import { recommendActions, type RecommendActionsInput, type RecommendActionsOutput } from "@/ai/flows/recommend-actions";
import { summarizeInsights, type SummarizeInsightsInput, type SummarizeInsightsOutput } from "@/ai/flows/summarize-insights";
import { chatWithCoach, type ChatWithCoachInput, type ChatWithCoachOutput } from "@/ai/flows/chat-with-coach-flow";
import type { JournalEntry, Reminder, JournalEntryForAI } from "@/lib/types";

export async function analyzeJournalEntriesAction(input: AnalyzeJournalEntriesInput): Promise<AnalyzeJournalEntriesOutput | null> {
  try {
    // Ensure dates in journalEntries are ISO strings if they aren't already
    const processedInput: AnalyzeJournalEntriesInput = {
      ...input,
      journalEntries: input.journalEntries.map(entry => ({
        ...entry,
        date: typeof entry.date === 'string' ? entry.date : (entry.date as unknown as Date).toISOString(),
      }) as JournalEntryForAI), // Cast to JournalEntryForAI as AI flow expects it
    };
    const result = await analyzeJournalEntries(processedInput);
    return result;
  } catch (error) {
    console.error("Error in analyzeJournalEntriesAction:", error);
    throw error; 
  }
}

export async function recommendActionsAction(input: RecommendActionsInput): Promise<RecommendActionsOutput | null> {
  try {
    const result = await recommendActions(input);
    return result;
  } catch (error) {
    console.error("Error in recommendActionsAction:", error);
    throw error;
  }
}

export async function summarizeInsightsAction(input: SummarizeInsightsInput): Promise<SummarizeInsightsOutput | null> {
  try {
    const result = await summarizeInsights(input);
    return result;
  } catch (error) {
    console.error("Error in summarizeInsightsAction:", error);
    throw error;
  }
}

export async function chatWithCoachAction(
  chatInput: Omit<ChatWithCoachInput, 'allJournalEntries' | 'allReminders'>,
  allJournalEntries: JournalEntry[], // These will come from DataContext, dates are Date objects
  allReminders: Reminder[]
): Promise<ChatWithCoachOutput | null> {
  try {
    // Map Date objects to ISO strings for journal entries for the AI
    const entriesForAI = allJournalEntries.map(entry => ({
      ...entry,
      date: entry.date.toISOString(), // Convert Date to ISO string
    }));

    const fullInput: ChatWithCoachInput = {
      ...chatInput,
      allJournalEntries: entriesForAI,
      allReminders: allReminders,
    };
    const result = await chatWithCoach(fullInput);
    return result;
  } catch (error) {
    console.error("Error in chatWithCoachAction:", error);
    throw error;
  }
}
