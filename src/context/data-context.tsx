"use client";

import type { JournalEntry, Reminder, AIInsight } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import {
  addJournalEntryToFirestore,
  getJournalEntriesFromFirestore,
  updateJournalEntryInFirestore,
  deleteJournalEntryFromFirestore,
  addReminderToFirestore,
  getRemindersFromFirestore,
  updateReminderInFirestore,
  deleteReminderFromFirestore,
  addAIInsightToFirestore,
  getAIInsightsFromFirestore,
  loadInitialDataForUser,
  checkUserHasData,
} from "@/lib/firebase/firestoreService";
import { uploadFileToStorage, deleteFileFromStorage } from "@/lib/firebase/storageService";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "userId">, voiceNoteFile?: Blob | null, imageFile?: File | null) => Promise<void>;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>, newVoiceNoteFile?: Blob | null, newImageFile?: File | null) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id" | "userId">) => Promise<void>;
  updateReminder: (reminderId: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  insightsHistory: AIInsight[];
  addInsightToHistory: (insight: Omit<AIInsight, "id" | "userId">) => Promise<void>;
  isLoadingData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialJournalEntriesData: Omit<JournalEntry, "id" | "date">[] = [
  {
    text: "Felt a bit overwhelmed with work today, but managed to complete my top priorities. Took a short walk in the evening which helped clear my head.",
    mood: "okay",
    tags: ["work", "stress", "self-care"],
  },
  {
    text: "Had a great conversation with an old friend. It's amazing how reconnecting can lift your spirits. Feeling grateful for good friends.",
    mood: "good",
    tags: ["friends", "gratitude", "connection"],
    // voiceNoteUrl will be placeholder or handled during initial data load if we want to include mock audio
  },
];

const initialRemindersData: Omit<Reminder, "id">[] = [
  {
    title: "Morning Meditation",
    time: "07:00",
    frequency: "daily",
    active: true,
    description: "10 minutes of mindfulness meditation.",
  },
  {
    title: "Gym Session",
    time: "18:00",
    frequency: "weekdays",
    active: true,
    description: "Strength training workout.",
  },
   {
    title: "Weekly Review",
    time: "16:00",
    frequency: "weekly",
    active: false,
    description: "Review journal and plan next week.",
  },
];

const initialInsightsHistoryData: Omit<AIInsight, "id" | "generatedAt">[] = [
  {
    themes: ["Procrastination", "Sleep Quality"],
    emotions: ["Anxious", "Tired"],
    stressors: ["Upcoming project deadline", "Late nights"],
    summary: "The past week shows a pattern of anxiety linked to work pressure and poor sleep. Procrastination appears to be a coping mechanism.",
    recommendations: "Consider breaking down tasks and setting aside dedicated focus time. Aim for a consistent sleep schedule.",
  }
];


export function DataProvider({ children }: { children: ReactNode }) {
  const { user, authLoading } = useAuth();
  const { toast } = useToast();

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [insightsHistory, setInsightsHistory] = useState<AIInsight[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = useCallback(async (userId: string) => {
    setIsLoadingData(true);
    try {
      const hasJournalData = await checkUserHasData(userId, 'journalEntries');
      if (!hasJournalData) {
        const initialEntriesWithDates = initialJournalEntriesData.map((entry, index) => ({
          ...entry,
          date: new Date(Date.now() - 86400000 * (initialJournalEntriesData.length - index)), // Dynamic dates
        }));
        const initialInsightsWithDates = initialInsightsHistoryData.map((insight, index) => ({
          ...insight,
          generatedAt: new Date(Date.now() - 86400000 * (5 + index)).toISOString(),
        }));

        await loadInitialDataForUser(userId, {
          journalEntries: initialEntriesWithDates,
          reminders: initialRemindersData,
          insightsHistory: initialInsightsWithDates,
        });
      }

      const [entries, rems, insights] = await Promise.all([
        getJournalEntriesFromFirestore(userId),
        getRemindersFromFirestore(userId),
        getAIInsightsFromFirestore(userId),
      ]);
      setJournalEntries(entries);
      setReminders(rems);
      setInsightsHistory(insights);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Could not load your data.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchData(user.uid);
    } else if (!user && !authLoading) {
      // Clear data if user logs out
      setJournalEntries([]);
      setReminders([]);
      setInsightsHistory([]);
      setIsLoadingData(false);
    }
  }, [user, authLoading, fetchData]);


  const addJournalEntry = async (entryData: Omit<JournalEntry, "id" | "userId" | "voiceNoteUrl" | "imageUrl">, voiceNoteBlob?: Blob | null, imageFile?: File | null) => {
    setIsLoadingData(true);
    try {
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to save an entry.", variant: "destructive" });
        throw new Error("User not authenticated for saving entry.");
      }

      let voiceNoteUrl: string | undefined = undefined;
      let imageUrl: string | undefined = undefined;

      if (voiceNoteBlob) {
        voiceNoteUrl = await uploadFileToStorage(user.uid, "voice-notes", voiceNoteBlob, `voice-note-${Date.now()}.webm`);
      }
      if (imageFile) {
        imageUrl = await uploadFileToStorage(user.uid, "journal-images", imageFile, `image-${Date.now()}.${imageFile.name.split('.').pop()}`);
      }
      
      const newEntry: Omit<JournalEntry, "id"> = {
        ...entryData,
        date: entryData.date || new Date(), 
        voiceNoteUrl,
        imageUrl,
      };
      
      const id = await addJournalEntryToFirestore(user.uid, newEntry);
      // Ensure date in local state is a Date object
      const entryForState = { ...newEntry, id, date: newEntry.date instanceof Date ? newEntry.date : new Date(newEntry.date) } as JournalEntry;
      setJournalEntries((prev) => [entryForState, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    } catch (error) {
      console.error("Error adding journal entry:", error);
      toast({ title: "Error Saving Entry", description: `Could not save journal entry. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error; // Re-throw the error for the calling component
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>, newVoiceNoteBlob?: Blob | null, newImageFile?: File | null) => {
    setIsLoadingData(true);
    try {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to update an entry.", variant: "destructive" });
            throw new Error("User not authenticated for updating entry.");
        }
        const currentEntry = journalEntries.find(e => e.id === entryId);
        const finalUpdates = { ...updates };

        if (newVoiceNoteBlob) {
            if (currentEntry?.voiceNoteUrl) await deleteFileFromStorage(currentEntry.voiceNoteUrl);
            finalUpdates.voiceNoteUrl = await uploadFileToStorage(user.uid, "voice-notes", newVoiceNoteBlob, `voice-note-${Date.now()}.webm`);
        } else if (updates.voiceNoteUrl === null && currentEntry?.voiceNoteUrl) { 
            await deleteFileFromStorage(currentEntry.voiceNoteUrl);
            finalUpdates.voiceNoteUrl = undefined;
        }

        if (newImageFile) {
            if (currentEntry?.imageUrl) await deleteFileFromStorage(currentEntry.imageUrl);
            finalUpdates.imageUrl = await uploadFileToStorage(user.uid, "journal-images", newImageFile, `image-${Date.now()}.${newImageFile.name.split('.').pop()}`);
        } else if (updates.imageUrl === null && currentEntry?.imageUrl) { 
            await deleteFileFromStorage(currentEntry.imageUrl);
            finalUpdates.imageUrl = undefined;
        }

        await updateJournalEntryInFirestore(user.uid, entryId, finalUpdates);
        setJournalEntries((prev) =>
            prev.map((entry) => (entry.id === entryId ? { ...entry, ...finalUpdates, date: finalUpdates.date ? (finalUpdates.date instanceof Date ? finalUpdates.date : new Date(finalUpdates.date)) : entry.date } : entry)).sort((a,b) => b.date.getTime() - a.date.getTime())
        );
    } catch (error) {
      console.error("Error updating journal entry:", error);
      toast({ title: "Error Updating Entry", description: `Could not update journal entry. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };

  const deleteJournalEntry = async (id: string) => {
    setIsLoadingData(true);
    try {
        if (!user) {
            toast({ title: "Authentication Error", description: "You must be logged in to delete an entry.", variant: "destructive" });
            throw new Error("User not authenticated for deleting entry.");
        }
        const entryToDelete = journalEntries.find(e => e.id === id);
        if (entryToDelete?.voiceNoteUrl) await deleteFileFromStorage(entryToDelete.voiceNoteUrl);
        if (entryToDelete?.imageUrl) await deleteFileFromStorage(entryToDelete.imageUrl);

        await deleteJournalEntryFromFirestore(user.uid, id);
        setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({ title: "Error Deleting Entry", description: `Could not delete journal entry. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };

  const addReminder = async (reminderData: Omit<Reminder, "id" | "userId">) => {
    setIsLoadingData(true);
    try {
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to add a reminder.", variant: "destructive" });
        throw new Error("User not authenticated for adding reminder.");
      }
      const id = await addReminderToFirestore(user.uid, reminderData);
      setReminders((prev) => [{ ...reminderData, id } as Reminder, ...prev]);
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({ title: "Error Saving Reminder", description: `Could not save reminder. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateReminder = async (reminderId: string, updates: Partial<Reminder>) => {
    setIsLoadingData(true);
    try {
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to update a reminder.", variant: "destructive" });
        throw new Error("User not authenticated for updating reminder.");
      }
      await updateReminderInFirestore(user.uid, reminderId, updates);
      setReminders((prev) =>
        prev.map((reminder) => (reminder.id === reminderId ? { ...reminder, ...updates } : reminder))
      );
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({ title: "Error Updating Reminder", description: `Could not update reminder. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };

  const deleteReminder = async (id: string) => {
    setIsLoadingData(true);
    try {
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to delete a reminder.", variant: "destructive" });
        throw new Error("User not authenticated for deleting reminder.");
      }
      await deleteReminderFromFirestore(user.uid, id);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({ title: "Error Deleting Reminder", description: `Could not delete reminder. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const addInsightToHistory = async (insightData: Omit<AIInsight, "id" | "userId">) => {
    setIsLoadingData(true);
    try {
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to save insights.", variant: "destructive" });
        throw new Error("User not authenticated for saving insight.");
      }
      const newInsightWithDate = {
        ...insightData,
        generatedAt: insightData.generatedAt || new Date().toISOString()
      };
      const id = await addAIInsightToFirestore(user.uid, newInsightWithDate);
      setInsightsHistory((prev) => [{ ...newInsightWithDate, id } as AIInsight, ...prev].sort((a,b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()));
    } catch (error) {
      console.error("Error adding insight:", error);
      toast({ title: "Error Saving Insight", description: `Could not save AI insight. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };
  
  return (
    <DataContext.Provider
      value={{
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        insightsHistory,
        addInsightToHistory,
        isLoadingData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}
