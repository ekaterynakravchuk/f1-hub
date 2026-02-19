"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScatterDataPoint {
  raceIndex: number;
  position: number;
}

interface CareerScatterChartProps {
  d1Data: ScatterDataPoint[];
  d2Data: ScatterDataPoint[];
  d1Name: string;
  d2Name: string;
  d1Color: string;
  d2Color: string;
}

export function CareerScatterChart({
  d1Data,
  d2Data,
  d1Name,
  d2Name,
  d1Color,
  d2Color,
}: CareerScatterChartProps) {
  const chartConfig: ChartConfig = {
    d1: { label: d1Name, color: d1Color },
    d2: { label: d2Name, color: d2Color },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Race Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <ScatterChart>
            <CartesianGrid strokeOpacity={0.2} />
            <XAxis
              dataKey="raceIndex"
              type="number"
              name="Race #"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: "Race #", position: "insideBottom", offset: -4 }}
            />
            <YAxis
              dataKey="position"
              type="number"
              reversed
              domain={[1, 25]}
              tickLine={false}
              axisLine={false}
              width={30}
              label={{
                value: "Position",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                const isD1 = item.payload && d1Data.includes(item.payload);
                const name = isD1 ? d1Name : d2Name;
                const color = isD1 ? d1Color : d2Color;
                return (
                  <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                    <span style={{ color }} className="font-medium">
                      {name}
                    </span>
                    <div className="mt-1 text-muted-foreground">
                      Race #{item.payload?.raceIndex} — P{item.payload?.position}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              name={d1Name}
              data={d1Data}
              fill={d1Color}
              opacity={0.6}
            />
            <Scatter
              name={d2Name}
              data={d2Data}
              fill={d2Color}
              opacity={0.6}
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
