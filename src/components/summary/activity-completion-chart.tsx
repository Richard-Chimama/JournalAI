"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { activity: "Meditate", completed: 5, goal: 7 },
  { activity: "Exercise", completed: 3, goal: 5 },
  { activity: "Read", completed: 6, goal: 7 },
  { activity: "Journal", completed: 7, goal: 7 },
]

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  goal: {
    label: "Goal",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig

export function ActivityCompletionChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-auto">
      <BarChart accessibilityLayer data={chartData} 
        margin={{
          left: -20, // Adjust to ensure labels are visible
        }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="activity"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.length > 10 ? `${value.slice(0,10)}...` : value}
        />
         <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
         />
        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
        <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
        <Bar dataKey="goal" fill="var(--color-goal)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
