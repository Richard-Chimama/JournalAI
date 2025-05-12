"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { AIInsight } from "@/lib/types";
import { Loader2Icon, LightbulbIcon, AlertTriangleIcon } from "lucide-react";
import { analyzeJournalEntriesAction } from "@/app/actions";
import { useDataContext } from "@/context/data-context";

export default function InsightsPage() {
  const { toast } = useToast();
  const { journalEntries } = useDataContext();
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeEntries = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    if (journalEntries.length === 0) {
      toast({
        title: "No Entries to Analyze",
        description: "Please write some journal entries first.",
        variant: "default",
      });
      setIsLoading(false);
      return;
    }

    // Concatenate journal entries text for analysis
    const entriesText = journalEntries.map(entry => `Date: ${entry.date.toISOString().split('T')[0]}\nMood: ${entry.mood || 'N/A'}\nEntry:\n${entry.text}\n---`).join("\n\n");

    try {
      const result = await analyzeJournalEntriesAction({ journalEntries: entriesText });
      if (result) {
        setInsights(result);
        toast({
          title: "Analysis Complete",
          description: "Insights have been generated from your journal entries.",
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
            Our AI will process your entries to provide you with valuable insights. This may take a few moments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyzeEntries} disabled={isLoading || journalEntries.length === 0} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LightbulbIcon className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Analyzing..." : (journalEntries.length === 0 ? "Add Entries to Analyze" : "Analyze Journal Entries")}
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

      {insights && (
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80">{insights.summary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-md">
              <CardHeader><CardTitle>Recurring Themes</CardTitle></CardHeader>
              <CardContent>
                {insights.themes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-foreground/80">
                    {insights.themes.map((theme, i) => <li key={i}>{theme}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">No specific themes identified.</p>}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader><CardTitle>Expressed Emotions</CardTitle></CardHeader>
              <CardContent>
                 {insights.emotions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-foreground/80">
                    {insights.emotions.map((emotion, i) => <li key={i}>{emotion}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">No specific emotions identified.</p>}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader><CardTitle>Potential Stressors</CardTitle></CardHeader>
              <CardContent>
                {insights.stressors.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-foreground/80">
                    {insights.stressors.map((stressor, i) => <li key={i}>{stressor}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">No specific stressors identified.</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md bg-accent/10 border-accent">
            <CardHeader>
              <CardTitle className="text-accent-foreground">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-accent-foreground/90">{insights.recommendations}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
