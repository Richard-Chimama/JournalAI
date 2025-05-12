
export interface JournalEntry {
  id: string;
  date: Date;
  text: string;
  mood?: Mood; // Optional mood tracking
  voiceNoteUrl?: string; // URL to stored voice note (Data URI)
  imageUrl?: string; // URL to stored image
  tags?: string[];
}

export type Mood = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface Reminder {
  id: string;
  title: string;
  time: string; // e.g., "09:00"
  frequency: 'daily' | 'weekly' | 'weekdays' | 'weekends' | string; // Could be cron string or custom
  description?: string;
  active: boolean;
}

export interface AIInsight {
  id: string; // Unique ID for the insight report
  generatedAt: string; // ISO date string for when the insight was generated
  themes: string[];
  emotions: string[];
  stressors: string[];
  summary: string;
  recommendations: string;
}

// Used for structured input to the AI
export interface JournalEntryForAI {
  date: string; // ISO string representation of the date
  mood?: Mood;
  text: string;
  voiceNoteDataUri?: string; // Base64 data URI for the voice note
}

export interface ChartDataPoint {
  date: string; // "YYYY-MM-DD" or "Mon", "Tue" etc.
  value: number;
  [key: string]: any; // For multiple lines/bars
}

export interface AuthFormData {
  email: string;
  password?: string; // Password might be optional for some flows in future e.g. OAuth
  confirmPassword?: string; // For signup forms
}

