
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import type { AIInsight, JournalEntryForAI } from "@/lib/types";
import { Loader2Icon, LightbulbIcon, AlertTriangleIcon, HistoryIcon } from "lucide-react";
import { analyzeJournalEntriesAction } from "@/app/actions";
import { useDataContext } from "@/context/data-context";
import { format, parseISO } from "date-fns";

export default function InsightsPage() {
  const { toast } = useToast();
  const { journalEntries, insightsHistory, addInsightToHistory } = useDataContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeEntries = async () => {
    setIsLoading(true);
    setError(null);

    if (journalEntries.length === 0) {
      toast({
        title: "No Entries to Analyze",
        description: "Please write some journal entries first.",
        variant: "default",
      });
      setIsLoading(false);
      return;
    }

    const entriesForAI: JournalEntryForAI[] = journalEntries.map(entry => ({
      date: entry.date.toISOString(),
      mood: entry.mood,
      text: entry.text,
      voiceNoteDataUri: entry.voiceNoteUrl, // voiceNoteUrl is already a data URI if present
    }));

    try {
      const result = await analyzeJournalEntriesAction({ journalEntries: entriesForAI });
      if (result) {
        const newInsight: AIInsight = {
          ...result,
          id: Date.now().toString(),
          generatedAt: new Date().toISOString(),
        };
        addInsightToHistory(newInsight);
        toast({
          title: "New Analysis Complete",
          description: "Fresh insights have been generated and saved.",
        });
      } else {
        throw new Error("AI analysis returned no result.");
      }
    } catch (err) {
      console.error("Error analyzing entries:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sortedInsightsHistory = [...insightsHistory].sort((a, b) => 
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Insights</h1>
        <p className="text-muted-foreground">
          Discover patterns, themes, and recommendations from your journal.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Analyze Your Journal</CardTitle>
          <CardDescription>
            Our AI will process your entries (including voice notes if available) to provide you with valuable insights. This may take a few moments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyzeEntries} disabled={isLoading || journalEntries.length === 0} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LightbulbIcon className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Analyzing..." : (journalEntries.length === 0 ? "Add Entries to Analyze" : "Generate New Insights")}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive bg-destructive/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangleIcon className="h-5 w-5" />
              Analysis Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {sortedInsightsHistory.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Insights History
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {sortedInsightsHistory.map((insight, index) => (
              <AccordionItem value={`insight-${insight.id}`} key={insight.id} className="bg-card border rounded-lg shadow-md">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                     <span className="font-semibold text-lg text-primary">
                        Insight Report - {format(parseISO(insight.generatedAt), "MMMM d, yyyy 'at' h:mm a")}
                     </span>
                     <span className="text-sm text-muted-foreground mt-1">
                        Themes: {insight.themes.slice(0,2).join(', ') || "N/A"}...
                     </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <Card className="shadow-sm">
                      <CardHeader><CardTitle className="text-xl">Summary</CardTitle></CardHeader>
                      <CardContent><p className="text-foreground/80">{insight.summary}</p></CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl">Recurring Themes</CardTitle></CardHeader>
                        <CardContent>
                          {insight.themes.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-foreground/80">
                              {insight.themes.map((theme, i) => <li key={`theme-${insight.id}-${i}`}>{theme}</li>)}
                            </ul>
                          ) : <p className="text-muted-foreground">No specific themes identified.</p>}
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl">Expressed Emotions</CardTitle></CardHeader>
                        <CardContent>
                          {insight.emotions.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-foreground/80">
                              {insight.emotions.map((emotion, i) => <li key={`emotion-${insight.id}-${i}`}>{emotion}</li>)}
                            </ul>
                          ) : <p className="text-muted-foreground">No specific emotions identified.</p>}
                        </CardContent>
                      </Card>
                    </div>
                     <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl">Potential Stressors</CardTitle></CardHeader>
                        <CardContent>
                          {insight.stressors.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-foreground/80">
                              {insight.stressors.map((stressor, i) => <li key={`stressor-${insight.id}-${i}`}>{stressor}</li>)}
                            </ul>
                          ) : <p className="text-muted-foreground">No specific stressors identified.</p>}
                        </CardContent>
                      </Card>

                    <Card className="shadow-sm bg-accent/10 border-accent">
                      <CardHeader><CardTitle className="text-xl text-accent-foreground">Recommended Actions</CardTitle></CardHeader>
                      <CardContent><p className="text-accent-foreground/90">{insight.recommendations}</p></CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
      {sortedInsightsHistory.length === 0 && !isLoading && !error && (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>No Insights Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Click the &quot;Generate New Insights&quot; button above to get your first AI-powered analysis of your journal entries.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
