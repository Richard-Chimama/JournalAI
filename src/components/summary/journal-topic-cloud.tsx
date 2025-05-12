"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const commonTopics = [
  { topic: "Work Stress", frequency: 12, color: "bg-red-100 text-red-800" },
  { topic: "Family", frequency: 10, color: "bg-blue-100 text-blue-800" },
  { topic: "Personal Growth", frequency: 8, color: "bg-green-100 text-green-800" },
  { topic: "Gratitude", frequency: 7, color: "bg-yellow-100 text-yellow-800" },
  { topic: "Future Plans", frequency: 5, color: "bg-purple-100 text-purple-800" },
  { topic: "Mindfulness", frequency: 4, color: "bg-teal-100 text-teal-800" },
];

// Custom styling for badges to align with the theme
const topicBadgeVariants = {
  default: "border-transparent bg-primary/20 text-primary-foreground hover:bg-primary/30",
  accent: "border-transparent bg-accent/20 text-accent-foreground hover:bg-accent/30",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
}

export function JournalTopicCloud() {
  // Sort topics by frequency for display
  const sortedTopics = [...commonTopics].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="flex flex-wrap gap-3 p-2 rounded-lg">
      {sortedTopics.map((item, index) => (
        <Badge
          key={item.topic}
          variant={index % 3 === 0 ? "default" : index % 3 === 1 ? "accent" : "secondary"}
          className={`px-3 py-1.5 text-sm cursor-pointer transition-transform hover:scale-105
            ${index % 3 === 0 ? topicBadgeVariants.default : 
              index % 3 === 1 ? topicBadgeVariants.accent : 
              topicBadgeVariants.secondary}
          `}
          style={{
            // Optional: slightly vary font size based on frequency
            // fontSize: `${Math.min(1, 0.75 + item.frequency / 20)}rem`,
          }}
        >
          {item.topic} ({item.frequency})
        </Badge>
      ))}
      {sortedTopics.length === 0 && <p className="text-muted-foreground">No topics identified yet. Keep journaling!</p>}
    </div>
  );
}
