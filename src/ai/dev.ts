import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-journal-entries.ts';
import '@/ai/flows/recommend-actions.ts';
import '@/ai/flows/summarize-insights.ts';