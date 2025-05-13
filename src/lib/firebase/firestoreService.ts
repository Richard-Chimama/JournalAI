
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import type { JournalEntry, Reminder, AIInsight } from "@/lib/types";

// Helper to convert Firestore Timestamps to Date objects and vice-versa for JournalEntry
const convertJournalEntryToFirestore = (entry: Partial<JournalEntry>): any => {
  const data: any = { ...entry };
  if (data.date && data.date instanceof Date) {
    data.date = Timestamp.fromDate(data.date);
  } else if (typeof data.date === 'string') {
    data.date = Timestamp.fromDate(new Date(data.date));
  }
  // Add createdAt and updatedAt timestamps
  if (!data.id) { // only for new entries
    data.createdAt = serverTimestamp();
  }
  data.updatedAt = serverTimestamp();
  delete data.id; // Firestore handles ID
  return data;
};

const convertJournalEntryFromFirestore = (docSnap: any): JournalEntry => {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  } as JournalEntry;
};

// Helper for Reminder (no date conversion needed as time is string)
const convertReminderToFirestore = (reminder: Partial<Reminder>): any => {
  const data: any = { ...reminder };
   if (!data.id) {
    data.createdAt = serverTimestamp();
  }
  data.updatedAt = serverTimestamp();
  delete data.id;
  return data;
};

const convertReminderFromFirestore = (docSnap: any): Reminder => {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  } as Reminder;
};


// Helper for AIInsight
const convertAIInsightToFirestore = (insight: Partial<AIInsight>): any => {
  const data: any = { ...insight };
   if (data.generatedAt && typeof data.generatedAt === 'string') {
    data.generatedAt = Timestamp.fromDate(new Date(data.generatedAt));
  } else if (data.generatedAt && data.generatedAt instanceof Date) {
    data.generatedAt = Timestamp.fromDate(data.generatedAt);
  }
  if (!data.id) {
    data.createdAt = serverTimestamp(); // Keep original generatedAt for analysis time
  }
  data.updatedAt = serverTimestamp();
  delete data.id;
  return data;
};

const convertAIInsightFromFirestore = (docSnap: any): AIInsight => {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    generatedAt: data.generatedAt instanceof Timestamp ? data.generatedAt.toDate().toISOString() : data.generatedAt,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  } as AIInsight;
};


// Journal Entries
export const addJournalEntryToFirestore = async (userId: string, entry: Omit<JournalEntry, "id">): Promise<string> => {
  const entryData = convertJournalEntryToFirestore(entry);
  const docRef = await addDoc(collection(db, "users", userId, "journalEntries"), entryData);
  return docRef.id;
};

export const getJournalEntriesFromFirestore = async (userId: string): Promise<JournalEntry[]> => {
  const q = query(collection(db, "users", userId, "journalEntries"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertJournalEntryFromFirestore);
};

export const updateJournalEntryInFirestore = async (userId: string, entryId: string, updates: Partial<JournalEntry>): Promise<void> => {
  const entryRef = doc(db, "users", userId, "journalEntries", entryId);
  await updateDoc(entryRef, convertJournalEntryToFirestore(updates));
};

export const deleteJournalEntryFromFirestore = async (userId: string, entryId: string): Promise<void> => {
  const entryRef = doc(db, "users", userId, "journalEntries", entryId);
  await deleteDoc(entryRef);
};

// Reminders
export const addReminderToFirestore = async (userId: string, reminder: Omit<Reminder, "id">): Promise<string> => {
  const reminderData = convertReminderToFirestore(reminder);
  const docRef = await addDoc(collection(db, "users", userId, "reminders"), reminderData);
  return docRef.id;
};

export const getRemindersFromFirestore = async (userId: string): Promise<Reminder[]> => {
  const q = query(collection(db, "users", userId, "reminders"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertReminderFromFirestore);
};

export const updateReminderInFirestore = async (userId: string, reminderId: string, updates: Partial<Reminder>): Promise<void> => {
  const reminderRef = doc(db, "users", userId, "reminders", reminderId);
  await updateDoc(reminderRef, convertReminderToFirestore(updates));
};

export const deleteReminderFromFirestore = async (userId: string, reminderId: string): Promise<void> => {
  const reminderRef = doc(db, "users", userId, "reminders", reminderId);
  await deleteDoc(reminderRef);
};

// AI Insights History
export const addAIInsightToFirestore = async (userId: string, insight: Omit<AIInsight, "id">): Promise<string> => {
  const insightData = convertAIInsightToFirestore(insight);
  const docRef = await addDoc(collection(db, "users", userId, "insightsHistory"), insightData);
  return docRef.id;
};

export const getAIInsightsFromFirestore = async (userId: string): Promise<AIInsight[]> => {
  const q = query(collection(db, "users", userId, "insightsHistory"), orderBy("generatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertAIInsightFromFirestore);
};

// Function to load initial data for a new user
export const loadInitialDataForUser = async (userId: string, initialData: {journalEntries: Omit<JournalEntry, "id">[], reminders: Omit<Reminder, "id">[], insightsHistory: Omit<AIInsight, "id">[]}) => {
  const batch = writeBatch(db);

  initialData.journalEntries.forEach(entry => {
    const docRef = doc(collection(db, "users", userId, "journalEntries"));
    batch.set(docRef, convertJournalEntryToFirestore(entry));
  });

  initialData.reminders.forEach(reminder => {
    const docRef = doc(collection(db, "users", userId, "reminders"));
    batch.set(docRef, convertReminderToFirestore(reminder));
  });
  
  initialData.insightsHistory.forEach(insight => {
    const docRef = doc(collection(db, "users", userId, "insightsHistory"));
    batch.set(docRef, convertAIInsightToFirestore(insight));
  });

  await batch.commit();
};

// Check if user has any data (e.g., to determine if initial data should be loaded)
export const checkUserHasData = async (userId: string, collectionName: 'journalEntries' | 'reminders' | 'insightsHistory'): Promise<boolean> => {
  const q = query(collection(db, "users", userId, collectionName));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
