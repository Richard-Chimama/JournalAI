"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { JournalEntry } from "@/lib/types";
import { PlusCircleIcon, BookOpenTextIcon, ImageOffIcon, MicOffIcon } from "lucide-react";
import Link from "next/link";
import { useDataContext } from "@/context/data-context";

export default function JournalPage() {
  const { journalEntries } = useDataContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your thoughts, feelings, and experiences.
          </p>
        </div>
        <Button asChild>
          <Link href="/journal/new">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      {journalEntries.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenTextIcon className="h-6 w-6 text-primary" />
              Your Journal is Empty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start by creating your first journal entry. It's a great way to capture your thoughts and track your journey.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/journal/new">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create First Entry
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {journalEntries.slice().sort((a,b) => b.date.getTime() - a.date.getTime()).map((entry) => (
            <Card key={entry.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{entry.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                {entry.mood && <CardDescription>Mood: <span className="font-semibold capitalize">{entry.mood}</span></CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-4 text-sm text-foreground/80">
                  {entry.text}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2 text-muted-foreground">
                  {entry.imageUrl && <ImageOffIcon className="h-4 w-4 text-primary" />}
                  {entry.voiceNoteUrl && <MicOffIcon className="h-4 w-4 text-primary" />}
                </div>
                <Button variant="outline" size="sm" asChild>
                  {/* Link to a detailed view page (not implemented in this step) */}
                  {/* <Link href={`/journal/${entry.id}`}>Read More</Link> */}
                  <span className="cursor-pointer">Read More</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
