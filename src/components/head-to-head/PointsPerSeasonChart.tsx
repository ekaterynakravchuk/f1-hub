"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PointsPerSeasonData {
  season: string;
  d1Points?: number;
  d2Points?: number;
}

interface PointsPerSeasonChartProps {
  data: PointsPerSeasonData[];
  d1Name: string;
  d2Name: string;
  d1Color: string;
  d2Color: string;
}

export function PointsPerSeasonChart({
  data,
  d1Name,
  d2Name,
  d1Color,
  d2Color,
}: PointsPerSeasonChartProps) {
  const chartConfig: ChartConfig = {
    d1Points: { label: d1Name, color: d1Color },
    d2Points: { label: d2Name, color: d2Color },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points Per Season</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeOpacity={0.2} />
            <XAxis
              dataKey="season"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="d1Points"
              stroke={d1Color}
              strokeWidth={2}
              dot={false}
              name={d1Name}
              connectNulls
            />
            <Line
              dataKey="d2Points"
              stroke={d2Color}
              strokeWidth={2}
              dot={false}
              name={d2Name}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
