
'use server';
/**
 * @fileOverview A conversational AI coach that interacts with the user about their journal entries and reminders.
 *
 * - chatWithCoach - A function that handles the chat interaction.
 * - ChatWithCoachInput - The input type for the chatWithCoach function.
 * - ChatWithCoachOutput - The return type for the chatWithCoach function.
 * - ChatMessage - Type for a single chat message.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { JournalEntry, Reminder } from '@/lib/types'; // Assuming these types are correctly defined

// Define Zod schemas for the data types if not already universally available in required format
const JournalEntrySchema = z.object({
  id: z.string(),
  date: z.string().describe("Date of the entry in ISO format."), // Dates will be passed as ISO strings
  text: z.string(),
  mood: z.string().optional(),
  voiceNoteUrl: z.string().optional().describe("URL to a voice note, if available."),
  imageUrl: z.string().optional().describe("URL to an image, if available."),
  tags: z.array(z.string()).optional(),
});

const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  time: z.string(),
  frequency: z.string(),
  description: z.string().optional(),
  active: z.boolean(),
});

const ChatMessageSchema = z.object({ // Removed 'export'
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatWithCoachInputSchema = z.object({
  chatHistory: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  newMessage: z.string().describe('The latest message from the user.'),
  allJournalEntries: z.array(JournalEntrySchema).describe('All available journal entries for context.'),
  allReminders: z.array(ReminderSchema).describe('All available reminders for context.'),
});
export type ChatWithCoachInput = z.infer<typeof ChatWithCoachInputSchema>;

const ChatWithCoachOutputSchema = z.object({
  response: z.string().describe("The AI coach's response to the user's message."),
});
export type ChatWithCoachOutput = z.infer<typeof ChatWithCoachOutputSchema>;

// Tool to get specific journal entries
const getJournalEntriesTool = ai.defineTool(
  {
    name: 'getJournalEntries',
    description: 'Fetches journal entries based on optional keywords or date queries. Use this to find specific information if the general context is not enough.',
    inputSchema: z.object({
      query: z.string().optional().describe('Keywords to search for in journal entry text. Case-insensitive.'),
      date: z.string().optional().describe('A specific date (YYYY-MM-DD) to find entries for. If query is also present, both must match.'),
    }),
    outputSchema: z.array(JournalEntrySchema),
  },
  async ({ query, date }, context?: any) => {
    const allEntries: JournalEntry[] = context?.allJournalEntries || [];
    if (!allEntries || allEntries.length === 0) return [];

    let filteredEntries = allEntries;

    if (date) {
        // Assuming dates in entries are ISO strings. Compare only the date part.
        const targetDateStr = new Date(date).toISOString().split('T')[0];
        filteredEntries = filteredEntries.filter(entry => {
            try {
                return new Date(entry.date).toISOString().split('T')[0] === targetDateStr;
            } catch (e) {
                return false; // Invalid date format in entry
            }
        });
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredEntries = filteredEntries.filter(entry =>
        entry.text.toLowerCase().includes(lowerQuery) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }
    return filteredEntries.slice(0, 5); // Return a limited number of entries to keep response concise
  }
);

// Tool to get specific reminders
const getRemindersTool = ai.defineTool(
  {
    name: 'getReminders',
    description: 'Fetches reminders, optionally filtered by status (active/inactive) or keywords in title/description.',
    inputSchema: z.object({
      status: z.enum(['active', 'inactive', 'all']).optional().describe("Filter reminders by their active status. Defaults to 'active' if not specified."),
      query: z.string().optional().describe('Keywords to search for in reminder title or description. Case-insensitive.'),
    }),
    outputSchema: z.array(ReminderSchema),
  },
  async ({ status = 'active', query }, context?: any) => {
    const allReminders: Reminder[] = context?.allReminders || [];
    if (!allReminders || allReminders.length === 0) return [];

    let filteredReminders = allReminders;

    if (status !== 'all') {
      filteredReminders = filteredReminders.filter(r => r.active === (status === 'active'));
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredReminders = filteredReminders.filter(reminder =>
        reminder.title.toLowerCase().includes(lowerQuery) ||
        (reminder.description && reminder.description.toLowerCase().includes(lowerQuery))
      );
    }
    return filteredReminders.slice(0, 5); // Limit results
  }
);

export async function chatWithCoach(input: ChatWithCoachInput): Promise<ChatWithCoachOutput> {
  // Pass allJournalEntries and allReminders into the context for the tools
  const flowInputWithContext = {
    ...input,
    // Tools will access these from the 'context' argument.
    // Genkit automatically makes flow input available as context to tools.
  };
  return chatWithCoachFlow(flowInputWithContext);
}

const systemPrompt = `You are Soul Compass, a friendly and insightful personal journal coach. Your goal is to help the user reflect on their thoughts, feelings, and experiences, offer encouragement, and provide gentle advice. You can also remind them of their scheduled habits or events.

You have access to the user's journal entries and reminders through available tools.
- Use 'getJournalEntries' to look up specific details from their past entries if they ask about them or if it's relevant to the conversation.
- Use 'getReminders' to check their upcoming or past reminders.

Keep your responses concise, empathetic, and supportive. If the user's query is vague, you can ask clarifying questions.
If you use a tool, briefly mention that you're looking up information if it feels natural, or just use the information in your response.
Do not make up journal entries or reminders if the tools return no results. Instead, inform the user that you couldn't find the information.

Chat History (for context):
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}

Current User Message:
{{newMessage}}

Brief summary of all journal entries for general context (use tools for specifics):
{{#if allJournalEntries.length}}
{{#each allJournalEntries}}
- Entry on {{this.date}}: {{truncate this.text 50}} {{#if this.mood}}(Mood: {{this.mood}}){{/if}}
{{/each}}
{{else}}
User has no journal entries yet.
{{/if}}

Brief summary of active reminders for general context (use tools for specifics):
{{#if (filterReminders allReminders 'active').length}}
Active Reminders:
{{#each (filterReminders allReminders 'active')}}
- {{this.title}} at {{this.time}} ({{this.frequency}})
{{/each}}
{{else}}
User has no active reminders.
{{/if}}
`;

// Custom Handlebars helper to truncate text
const handlebarsOptions = {
    helpers: {
      truncate: (str: string, len: number) => {
        if (str.length > len && str.length > 0) {
          let new_str = str + " ";
          new_str = str.substr(0, len);
          new_str = str.substr(0, new_str.lastIndexOf(" "));
          new_str = new_str.length > 0 ? new_str : str.substr(0, len);
          return new_str + "...";
        }
        return str;
      },
      filterReminders: (reminders: Reminder[], status: 'active' | 'inactive' | 'all') => {
        if (!reminders) return [];
        if (status === 'all') return reminders;
        return reminders.filter(r => r.active === (status === 'active'));
      }
    }
};


const chatPrompt = ai.definePrompt({
  name: 'chatWithCoachPrompt',
  input: { schema: ChatWithCoachInputSchema },
  output: { schema: ChatWithCoachOutputSchema },
  prompt: systemPrompt,
  tools: [getJournalEntriesTool, getRemindersTool],
  model: 'googleai/gemini-1.5-flash-latest', // Ensure this model supports tool use
  promptArgs: handlebarsOptions,
  config: {
    safetySettings: [ // Relax safety settings if needed for journaling content, be cautious
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE'},
    ],
  }
});

const chatWithCoachFlow = ai.defineFlow(
  {
    name: 'chatWithCoachFlow',
    inputSchema: ChatWithCoachInputSchema,
    outputSchema: ChatWithCoachOutputSchema,
  },
  async (input) => {
    // The input 'input' already contains allJournalEntries and allReminders
    // Genkit will make these available to the tools via their context argument if the tools are defined to accept it,
    // or if the tools are closures accessing a variable in the flow's scope.
    // Here, we are passing the full input to the prompt, and tools will get this input as their `context`.
    const { output } = await chatPrompt(input);
    if (!output) {
        return { response: "I'm sorry, I couldn't generate a response at this moment. Please try again." };
    }
    return output;
  }
);

