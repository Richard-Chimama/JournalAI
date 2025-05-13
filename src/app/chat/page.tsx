
"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/ai/flows/chat-with-coach-flow";
import { chatWithCoachAction } from "@/app/actions";
import { useDataContext } from "@/context/data-context";
import { useAuth } from "@/context/auth-context";
import { BotIcon, Loader2Icon, SendIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { toast } = useToast();
  const { user, authLoading } = useAuth();
  const { journalEntries, reminders, isLoadingData: contextLoading } = useDataContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    // Add initial greeting from assistant only once and if no messages yet
    if (messages.length === 0) {
        setMessages([
        { role: "assistant", content: "Hello! I'm Soul Compass, your personal journal coach. How can I help you reflect or plan today?" }
        ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency to run only once on mount


  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const currentMessage = inputValue.trim();
    if (!currentMessage || !user) return;

    const newUserMessage: ChatMessage = { role: "user", content: currentMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      // Prepare a limited history for the AI to keep context concise
      const chatHistoryForAI = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));


      const result = await chatWithCoachAction(
        {
          chatHistory: chatHistoryForAI,
          newMessage: currentMessage,
        },
        journalEntries, 
        reminders       
      );

      if (result && result.response) {
        const assistantResponse: ChatMessage = { role: "assistant", content: result.response };
        setMessages((prevMessages) => [...prevMessages, assistantResponse]);
      } else {
        toast({
          title: "No Response",
          description: "The AI coach didn't provide a response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error chatting with coach:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
      });
      const errorResponse: ChatMessage = { role: "assistant", content: `Sorry, I encountered an error: ${errorMessage}` };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsSending(false);
    }
  };
  
  const getUserInitials = (email?: string | null) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const isLoading = authLoading || contextLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] sm:h-[calc(100vh-theme(spacing.16)-theme(spacing.16))]">
      <CardHeader className="pb-2 pt-0 px-0">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Chat with Soul Compass</CardTitle>
        <CardDescription className="text-muted-foreground">
          Your personal AI coach for guidance and reflection.
        </CardDescription>
      </CardHeader>

      <Card className="flex-1 flex flex-col shadow-lg overflow-hidden">
        <ScrollArea className="flex-1 p-4 sm:p-6 space-y-4" ref={scrollAreaRef}>
          {isLoading && messages.length <= 1 && ( // Show loading placeholder if initial data is loading and only greeting is present
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="h-8 w-8 border">
                 <AvatarFallback><BotIcon className="h-5 w-5 text-primary" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-4 py-3">
                <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback><BotIcon className="h-5 w-5 text-primary" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-4 py-2.5 break-words",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && user && (
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/32/32`} alt={user.displayName || "User"} data-ai-hint="person face" />
                  <AvatarFallback>{getUserInitials(user.email)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isSending && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="h-8 w-8 border">
                 <AvatarFallback><BotIcon className="h-5 w-5 text-primary" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-xl px-4 py-3">
                <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </ScrollArea>

        <CardContent className="p-4 sm:p-6 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-4">
            <Input
              type="text"
              placeholder={!user || isLoading ? "Loading chat..." : "Ask about your journal, reminders, or for advice..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 text-base sm:text-sm"
              disabled={isSending || !user || isLoading}
              autoFocus
            />
            <Button type="submit" size="icon" disabled={isSending || !inputValue.trim() || !user || isLoading} aria-label="Send message">
              {isSending ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <SendIcon className="h-5 w-5" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
