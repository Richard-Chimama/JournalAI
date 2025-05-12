"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LightbulbIcon, PlusCircleIcon } from "lucide-react";
import { MoodTrendChart } from "@/components/summary/mood-trend-chart";
import { ActivityCompletionChart } from "@/components/summary/activity-completion-chart";
import { JournalTopicCloud } from "@/components/summary/journal-topic-cloud";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your weekly overview and quick actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/insights">
              <LightbulbIcon className="mr-2 h-4 w-4" />
              View Insights
            </Link>
          </Button>
          <Button asChild>
            <Link href="/journal/new">
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              New Journal Entry
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mood Trends</CardTitle>
            <CardDescription>Your mood fluctuations over the past week.</CardDescription>
          </CardHeader>
          <CardContent>
            <MoodTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Completion</CardTitle>
            <CardDescription>Your progress on habits and reminders.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityCompletionChart />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Common Journal Topics</CardTitle>
            <CardDescription>Themes frequently appearing in your entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <JournalTopicCloud />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
