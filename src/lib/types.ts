export interface JournalEntry {
  id: string;
  date: Date;
  text: string;
  mood?: Mood; // Optional mood tracking
  voiceNoteUrl?: string; // URL to stored voice note
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
  themes: string[];
  emotions: string[];
  stressors: string[];
  summary: string;
  recommendations: string;
}

export interface ChartDataPoint {
  date: string; // "YYYY-MM-DD" or "Mon", "Tue" etc.
  value: number;
  [key: string]: any; // For multiple lines/bars
}
