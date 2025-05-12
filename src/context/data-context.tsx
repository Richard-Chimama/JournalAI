
"use client";

import type { JournalEntry, Reminder, AIInsight } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface DataContextType {
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  insightsHistory: AIInsight[];
  addInsightToHistory: (insight: AIInsight) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialJournalEntries: JournalEntry[] = [
  {
    id: "1",
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    text: "Felt a bit overwhelmed with work today, but managed to complete my top priorities. Took a short walk in the evening which helped clear my head.",
    mood: "okay",
    tags: ["work", "stress", "self-care"],
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000), // 1 day ago
    text: "Had a great conversation with an old friend. It's amazing how reconnecting can lift your spirits. Feeling grateful for good friends.",
    mood: "good",
    tags: ["friends", "gratitude", "connection"],
    voiceNoteUrl: "data:audio/webm;base64,R0JNdAAgAAAADFdlYk1WUDggQUAAAAAAAQAPRLpA////+4Lry5AAG89uFHon2N8gQVL8f8/99J0h8f//+23//j0PAAAAAANA8OqAgCgAAAAAEEYhYAAIYAA/+BCgAAAAAARNABAAAAARgBBAAAAABAAgAAAIWFiAYAAAAAAABCAoCAAAAAgAAgAAAIKYAYAAAAAABAA4AgAQAAAAAEEYhYAAIYAA/+BCgAAAAAARNABAAAAARgBBAAAAABAAgAAAIWFiAYAAAAAAABCAoCAAAAAgAAgAAAIKYAYAAAAAABAA4AgAQAAAAAEnN2d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3D" // Mock voice note for demonstration, replace with actual data if available
  },
];

const initialReminders: Reminder[] = [
  {
    id: "1",
    title: "Morning Meditation",
    time: "07:00",
    frequency: "daily",
    active: true,
    description: "10 minutes of mindfulness meditation.",
  },
  {
    id: "2",
    title: "Gym Session",
    time: "18:00",
    frequency: "weekdays",
    active: true,
    description: "Strength training workout.",
  },
   {
    id: "3",
    title: "Weekly Review",
    time: "16:00",
    frequency: "weekly", // Assuming weekly on Sunday
    active: false,
    description: "Review journal and plan next week.",
  },
];

const initialInsightsHistory: AIInsight[] = [
  {
    id: "prev1",
    generatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    themes: ["Procrastination", "Sleep Quality"],
    emotions: ["Anxious", "Tired"],
    stressors: ["Upcoming project deadline", "Late nights"],
    summary: "The past week shows a pattern of anxiety linked to work pressure and poor sleep. Procrastination appears to be a coping mechanism.",
    recommendations: "Consider breaking down tasks and setting aside dedicated focus time. Aim for a consistent sleep schedule.",
  }
];


export function DataProvider({ children }: { children: ReactNode }) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [insightsHistory, setInsightsHistory] = useState<AIInsight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);


  useEffect(() => {
    // Load from localStorage on mount
    const storedEntries = localStorage.getItem("soulCompassJournalEntries");
    if (storedEntries) {
      setJournalEntries(JSON.parse(storedEntries).map((e: any) => ({...e, date: new Date(e.date)})));
    } else {
      setJournalEntries(initialJournalEntries); 
    }

    const storedReminders = localStorage.getItem("soulCompassReminders");
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    } else {
       setReminders(initialReminders);
    }

    const storedInsightsHistory = localStorage.getItem("soulCompassInsightsHistory");
    if (storedInsightsHistory) {
      setInsightsHistory(JSON.parse(storedInsightsHistory));
    } else {
      setInsightsHistory(initialInsightsHistory);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if(isLoaded) {
      localStorage.setItem("soulCompassJournalEntries", JSON.stringify(journalEntries));
    }
  }, [journalEntries, isLoaded]);

  useEffect(() => {
    if(isLoaded) {
     localStorage.setItem("soulCompassReminders", JSON.stringify(reminders));
    }
  }, [reminders, isLoaded]);

  useEffect(() => {
    if(isLoaded) {
     localStorage.setItem("soulCompassInsightsHistory", JSON.stringify(insightsHistory));
    }
  }, [insightsHistory, isLoaded]);


  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => [...prev, entry]);
  };

  const updateJournalEntry = (updatedEntry: JournalEntry) => {
    setJournalEntries((prev) =>
      prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    );
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder]);
  };

  const updateReminder = (updatedReminder: Reminder) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === updatedReminder.id ? updatedReminder : reminder))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };
  
  const addInsightToHistory = (insight: AIInsight) => {
    setInsightsHistory((prev) => [insight, ...prev]); // Add new insight to the beginning
  };
  
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

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
