"use client";

import {
  BarChart,
  Bar,
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

interface TeammateQualifyingData {
  season: string;
  d1Wins: number;
  d2Wins: number;
}

interface TeammateQualifyingChartProps {
  data: TeammateQualifyingData[];
  d1Name: string;
  d2Name: string;
  d1Color: string;
  d2Color: string;
  totalD1Wins: number;
  totalD2Wins: number;
  noTeammateSeasons: boolean;
}

export function TeammateQualifyingChart({
  data,
  d1Name,
  d2Name,
  d1Color,
  d2Color,
  totalD1Wins,
  totalD2Wins,
  noTeammateSeasons,
}: TeammateQualifyingChartProps) {
  if (noTeammateSeasons) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teammate Qualifying H2H</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            These drivers were never teammates.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig: ChartConfig = {
    d1Wins: { label: d1Name, color: d1Color },
    d2Wins: { label: d2Name, color: d2Color },
  };

  const total = totalD1Wins + totalD2Wins;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teammate Qualifying H2H</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          <span style={{ color: d1Color }} className="font-medium">
            {d1Name}
          </span>
          : {totalD1Wins} wins
          {" | "}
          <span style={{ color: d2Color }} className="font-medium">
            {d2Name}
          </span>
          : {totalD2Wins} wins
          {" | "}
          {total} races
        </p>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeOpacity={0.2} />
            <XAxis
              dataKey="season"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={30} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="d1Wins"
              fill={d1Color}
              name={d1Name}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="d2Wins"
              fill={d2Color}
              name={d2Name}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
