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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={{ stroke: "#E5E7EB" }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          yAxisId="revenue"
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(value: number) => `Rs ${value.toLocaleString("en-PK")}`}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#6B7280" }}
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
          stroke="#16A34A"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke="#F5A623"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
