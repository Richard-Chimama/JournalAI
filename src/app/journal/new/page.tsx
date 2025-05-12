"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntry, Mood } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CalendarIcon, ImagePlusIcon, MicIcon, SaveIcon } from "lucide-react";
import { format } from "date-fns";
import { useDataContext } from "@/context/data-context";

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addJournalEntry } = useDataContext();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  // Placeholders for voice/image data
  const [voiceNote, setVoiceNote] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({
        title: "Text is required",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(), // Simple ID generation
      date: date || new Date(),
      text,
      mood,
      // In a real app, voiceNoteUrl and imageUrl would be set after uploading files
      voiceNoteUrl: voiceNote ? "mock-voice-url.mp3" : undefined,
      imageUrl: image ? "mock-image-url.jpg" : undefined,
      tags: [], // Basic tag functionality can be added here
    };

    addJournalEntry(newEntry);

    toast({
      title: "Journal Entry Saved",
      description: "Your thoughts have been recorded.",
    });
    router.push("/journal");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Journal Entry</h1>
        <p className="text-muted-foreground">
          Capture your thoughts, feelings, and experiences.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create Your Entry</CardTitle>
          <CardDescription>Fill in the details below. Your privacy is respected.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="mood">Mood (Optional)</Label>
                <Select onValueChange={(value) => setMood(value as Mood)} value={mood}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">Great</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="okay">Okay</SelectItem>
                    <SelectItem value="bad">Bad</SelectItem>
                    <SelectItem value="terrible">Terrible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="text">Your Thoughts</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's on your mind today?"
                rows={10}
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button type="button" variant="outline" disabled className="w-full">
                <MicIcon className="mr-2 h-4 w-4" />
                Add Voice Note (Coming Soon)
              </Button>
              <Button type="button" variant="outline" disabled className="w-full">
                <ImagePlusIcon className="mr-2 h-4 w-4" />
                Add Image (Coming Soon)
              </Button>
            </div>
            {/* Placeholder for file inputs if needed for voice/image
            <div>
              <Label htmlFor="voiceNote">Voice Note</Label>
              <Input type="file" id="voiceNote" accept="audio/*" onChange={(e) => setVoiceNote(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input type="file" id="image" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="mt-1" />
            </div>
            */}

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
