"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatPrice } from "@/lib/utils";

export interface SalesChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

export function SalesChart({ data }: { data: SalesChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6d9ee" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#6b5a78" }}
          axisLine={{ stroke: "#e6d9ee" }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          yAxisId="revenue"
          tick={{ fontSize: 12, fill: "#6b5a78" }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(value: number) => `Rs ${value.toLocaleString("en-PK")}`}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#6b5a78" }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            fontSize: 13,
          }}
          formatter={(value, name) =>
            name === "Revenue" ? formatPrice(Number(value)) : Number(value)
          }
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#4b1d6e"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke="#8a5cb0"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
