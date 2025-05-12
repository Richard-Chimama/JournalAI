"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import type { ChartConfig } from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Monday", mood: 4 },
  { day: "Tuesday", mood: 3 },
  { day: "Wednesday", mood: 5 },
  { day: "Thursday", mood: 4 },
  { day: "Friday", mood: 3 },
  { day: "Saturday", mood: 5 },
  { day: "Sunday", mood: 4 },
]

const chartConfig = {
  mood: {
    label: "Mood Score (1-5)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function MoodTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-auto">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          domain={[0, 5]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="mood"
          type="monotone"
          stroke="var(--color-mood)"
          strokeWidth={3}
          dot={{
            fill: "var(--color-mood)",
            r: 4,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
