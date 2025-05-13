
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircleIcon, BookOpenTextIcon, ImageIcon, MicIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useDataContext } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";

export default function JournalPage() {
  const { journalEntries, isLoadingData } = useDataContext();
  const { user, authLoading } = useAuth();

  if (authLoading || (user && isLoadingData)) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
          {journalEntries.map((entry) => (
            <Card key={entry.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <CardHeader>
                <CardTitle>{entry.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                {entry.mood && <CardDescription>Mood: <span className="font-semibold capitalize">{entry.mood}</span></CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                {entry.imageUrl && (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                    <Image 
                      src={entry.imageUrl} 
                      alt="Journal entry image" 
                      layout="fill" 
                      objectFit="cover" 
                      className="transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="journal visual"
                      unoptimized // Required for external URLs not in next.config.js images.domains
                    />
                  </div>
                )}
                <p className="line-clamp-4 text-sm text-foreground/80">
                  {entry.text}
                </p>
                 {entry.voiceNoteUrl && (
                  <div className="mt-2">
                    <audio controls src={entry.voiceNoteUrl} className="w-full h-10">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2 text-muted-foreground">
                  {entry.imageUrl && <ImageIcon className="h-4 w-4 text-primary" />}
                  {entry.voiceNoteUrl && <MicIcon className="h-4 w-4 text-primary" />} 
                </div>
                <Button variant="outline" size="sm" asChild disabled>
                  {/* Link to a detailed view page (not implemented in this step) */}
                  {/* <Link href={`/journal/${entry.id}`}>Read More</Link> */}
                  <span className="cursor-not-allowed">Read More</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
