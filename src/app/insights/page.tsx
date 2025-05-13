
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import type { AIInsight, JournalEntryForAI } from "@/lib/types";
import { Loader2Icon, LightbulbIcon, AlertTriangleIcon, HistoryIcon } from "lucide-react";
import { analyzeJournalEntriesAction } from "@/app/actions";
import { useDataContext } from "@/context/data-context";
import { format, parseISO } from "date-fns";
import { getFileAsDataUrl } from "@/lib/firebase/storageService"; // Import the new service
import { useAuth } from "@/context/auth-context";

export default function InsightsPage() {
  const { toast } = useToast();
  const { user, authLoading } = useAuth();
  const { journalEntries, insightsHistory, addInsightToHistory, isLoadingData: contextLoading } = useDataContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeEntries = useCallback(async () => {
    if (!user) {
      toast({ title: "Authentication Error", description: "Please log in to analyze entries.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setError(null);

    if (journalEntries.length === 0) {
      toast({
        title: "No Entries to Analyze",
        description: "Please write some journal entries first.",
        variant: "default",
      });
      setIsAnalyzing(false);
      return;
    }

    try {
      const entriesForAI: JournalEntryForAI[] = await Promise.all(
        journalEntries.map(async (entry) => {
          let voiceNoteDataUri: string | undefined = undefined;
          let imageDataUri: string | undefined = undefined;

          if (entry.voiceNoteUrl) {
            try {
              voiceNoteDataUri = await getFileAsDataUrl(entry.voiceNoteUrl);
            } catch (e) {
              console.warn(`Failed to fetch/convert voice note for entry ${entry.id}:`, e);
              toast({ title: "Media Error", description: `Could not load voice note for an entry. Analysis will proceed without it.`, variant: "default", duration: 2000});
            }
          }
          if (entry.imageUrl) {
            try {
              imageDataUri = await getFileAsDataUrl(entry.imageUrl);
            } catch (e) {
              console.warn(`Failed to fetch/convert image for entry ${entry.id}:`, e);
               toast({ title: "Media Error", description: `Could not load image for an entry. Analysis will proceed without it.`, variant: "default", duration: 2000});
            }
          }

          return {
            date: entry.date.toISOString(),
            mood: entry.mood,
            text: entry.text,
            voiceNoteDataUri,
            imageDataUri,
          };
        })
      );

      const result = await analyzeJournalEntriesAction({ journalEntries: entriesForAI });
      if (result) {
        const newInsight: Omit<AIInsight, "id" | "userId"> = { // userId will be handled by context
          ...result,
          generatedAt: new Date().toISOString(),
        };
        await addInsightToHistory(newInsight); // addInsightToHistory is now async
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
      setIsAnalyzing(false);
    }
  }, [user, journalEntries, addInsightToHistory, toast]);

  const sortedInsightsHistory = [...insightsHistory].sort((a, b) => 
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  
  const isLoading = authLoading || contextLoading || isAnalyzing;


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
            Our AI will process your entries (including voice notes and images if available) to provide you with valuable insights. This may take a few moments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyzeEntries} disabled={isLoading || journalEntries.length === 0 || !user} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LightbulbIcon className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? "Analyzing..." : (journalEntries.length === 0 ? "Add Entries to Analyze" : "Generate New Insights")}
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
      
      {isLoading && !isAnalyzing && ( // Show general loading spinner if not specifically analyzing
          <div className="flex justify-center items-center py-10">
            <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
          </div>
      )}


      {!isLoading && sortedInsightsHistory.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Insights History
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {sortedInsightsHistory.map((insight) => (
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
                      <CardContent><p className="text-foreground/80 whitespace-pre-wrap">{insight.summary}</p></CardContent>
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
                      <CardContent><p className="text-accent-foreground/90 whitespace-pre-wrap">{insight.recommendations}</p></CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
      {!isLoading && sortedInsightsHistory.length === 0 && !error && (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>No Insights Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {user ? 'Click the "Generate New Insights" button above to get your first AI-powered analysis of your journal entries.' : 'Please log in to generate insights.'}
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
