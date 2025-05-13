
"use client";

import { useState, type FormEvent, useEffect, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Mood, JournalEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CalendarIcon, ImagePlusIcon, MicIcon, SaveIcon, RefreshCcwIcon, Trash2Icon, Loader2Icon, AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import { useDataContext } from "@/context/data-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function NewJournalEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addJournalEntry, isLoadingData } = useDataContext();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  
  // Image State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // For local preview
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Voice Note State
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioPreviewUrl, setRecordedAudioPreviewUrl] = useState<string | null>(null); // For local preview
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);


  useEffect(() => {
    const getMicrophonePermission = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicrophonePermission(true);
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.error('Error accessing microphone:', error);
          setHasMicrophonePermission(false);
          // Toast moved to button click to avoid spamming on load if permission is denied by default
        }
      } else {
         toast({
            title: "Media Devices Not Supported",
            description: "Your browser does not support voice recording on this device/browser.",
            variant: "destructive",
        });
      }
    };
    getMicrophonePermission();
    
    return () => {
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recordedAudioPreviewUrl) URL.revokeObjectURL(recordedAudioPreviewUrl);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // imagePreviewUrl and recordedAudioPreviewUrl are intentionally omitted to avoid loop with revokeObjectURL

  const startRecording = async () => {
    if (!hasMicrophonePermission) {
      toast({ title: "Microphone permission required", description: "Please enable microphone permissions in your browser settings.", variant: "destructive" });
      return;
    }
    if (isRecording || recordedAudioBlob) { 
      handleClearRecording(true); 
      return;
    }

    try {
      setIsProcessingAudio(true); // Show processing early
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
        setRecordedAudioBlob(audioBlob);
        const previewUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioPreviewUrl(previewUrl);
        setIsProcessingAudio(false);
        toast({ title: "Recording finished" });
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setIsRecording(false);
        setIsProcessingAudio(false);
        toast({title: "Recording error", description: "Something went wrong during recording.", variant: "destructive"});
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsProcessingAudio(false); // Done with initial setup for recording
      toast({ title: "Recording started..." });
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsProcessingAudio(false);
      toast({ title: "Could not start recording", description: (error as Error).message, variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // onstop will handle the rest
      setIsRecording(false);
    }
  };

  const handleClearRecording = (startNewRecording = false) => {
    if (recordedAudioPreviewUrl) URL.revokeObjectURL(recordedAudioPreviewUrl);
    setRecordedAudioPreviewUrl(null);
    setRecordedAudioBlob(null);
    audioChunksRef.current = [];

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop(); // This will trigger onstop, which cleans up the stream
    } else {
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);


    if (startNewRecording) {
        setTimeout(() => startRecording(), 100); // Small delay to ensure resources are freed
    } else {
        toast({ title: "Recording cleared" });
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); // Revoke old preview URL

      setSelectedImageFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(newPreviewUrl);
      setIsProcessingImage(false);
      toast({ title: "Image selected" });
    }
  };

  const handleClearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setSelectedImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Reset file input
    }
    toast({ title: "Image cleared" });
  };

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

    const entryData: Omit<JournalEntry, "id" | "voiceNoteUrl" | "imageUrl"> = {
      date: date || new Date(),
      text,
      mood,
      tags: [], 
    };

    try {
      await addJournalEntry(entryData, recordedAudioBlob, selectedImageFile);
      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts have been recorded.",
      });
      // Reset form state
      setDate(new Date());
      setText("");
      setMood(undefined);
      handleClearRecording();
      handleClearImage();
      router.push("/journal");
    } catch (error) {
      // Error is handled by addJournalEntry in context
    }
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
            
            <div className="space-y-2">
                <Label>Voice Note (Optional)</Label>
                {!hasMicrophonePermission && typeof navigator !== "undefined" && navigator.mediaDevices && (
                     <Alert variant="destructive">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <AlertTitle>Microphone Access Denied</AlertTitle>
                        <AlertDescription>
                        To record voice notes, please enable microphone permissions in your browser settings and refresh the page.
                        </AlertDescription>
                    </Alert>
                )}
                {isProcessingAudio && !isRecording && ( // Show processing only when not actively recording
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2Icon className="h-5 w-5 animate-spin" />
                        <span>Processing audio...</span>
                    </div>
                )}
                {recordedAudioPreviewUrl && !isProcessingAudio && (
                    <div className="space-y-2">
                        <audio controls src={recordedAudioPreviewUrl} className="w-full"></audio>
                        <div className="flex space-x-2">
                            <Button type="button" variant="outline" onClick={() => handleClearRecording(true)} disabled={isRecording || isProcessingAudio || isLoadingData}>
                                <RefreshCcwIcon className="mr-2 h-4 w-4" /> Re-record
                            </Button>
                            <Button type="button" variant="destructive" onClick={() => handleClearRecording(false)} disabled={isRecording || isProcessingAudio || isLoadingData}>
                                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>
                )}
                {!recordedAudioPreviewUrl && !isProcessingAudio && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!hasMicrophonePermission || isProcessingAudio || isLoadingData}
                        className="w-full"
                    >
                        <MicIcon className="mr-2 h-4 w-4" />
                        {isRecording ? "Stop Recording" : (recordedAudioBlob ? "Record Again" : "Record Voice Note")}
                    </Button>
                )}
                 {isRecording && (
                    <p className="text-sm text-primary flex items-center">
                        <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        Recording...
                    </p>
                )}
            </div>

            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*" 
                ref={imageInputRef}
                onChange={handleImageChange} 
                className="hidden" 
                id="image-upload"
                disabled={isProcessingImage || isLoadingData}
              />
              {isProcessingImage && (
                 <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                    <span>Processing image...</span>
                  </div>
              )}
              {imagePreviewUrl && !isProcessingImage && (
                <div className="relative group w-48 h-48"> {/* Fixed size for preview */}
                  <Image src={imagePreviewUrl} alt="Selected image preview" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="journal image"/>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    onClick={handleClearImage} 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Clear image"
                    disabled={isProcessingImage || isLoadingData}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </Button>
                </div>
              )}
              {!imagePreviewUrl && !isProcessingImage && (
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => imageInputRef.current?.click()} 
                    className="w-full"
                    disabled={isProcessingImage || isLoadingData}
                >
                  <ImagePlusIcon className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              )}
            </div>
           
            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isRecording || isProcessingAudio || isProcessingImage || isLoadingData}>
                {isLoadingData ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                Save Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
