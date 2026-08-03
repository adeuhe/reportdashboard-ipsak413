"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  data: { month: string; ecl: number; npf: number }[];
};

// Formatter singkat untuk nominal
const formatRupiahShort = (value: number) => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `Rp ${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)}M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(2)}Jt`;
  if (abs >= 1_000) return `Rp ${(value / 1_000).toFixed(2)}Rb`;
  return `Rp ${value}`;
};

export default function EclNpfTrendChart({ data }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex-1 min-w-0">
      <div className="mb-3 text-sm font-semibold text-slate-700">
        ECL & NPF Trend
        <span className="ml-2 text-xs font-normal text-slate-700">(Last 6 Months)</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />

            {/* ECL YAxis */}
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#2563eb"
              tickFormatter={formatRupiahShort}
              label={{
                value: "ECL",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#2563eb", fontSize: 12 },
              }}
            />

            {/* NPF YAxis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#dc2626"
              tickFormatter={formatRupiahShort}
              label={{
                value: "NPF",
                angle: 90,
                position: "insideRight",
                style: { fill: "#dc2626", fontSize: 12 },
              }}
            />

            <Tooltip
              formatter={(value: any, name: any) => {
                if (value === undefined || value === null) return ["-", name];
                const key = String(name);
                return [formatRupiahShort(value), key];
              }}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                padding: "8px",
              }}
              labelStyle={{ color: "#475569", fontSize: 12, fontWeight: 500 }}
              itemStyle={{ color: "#1e293b", fontSize: 12 }}
            />

            <Legend verticalAlign="top" height={24} />

            {/* ECL LINE */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ecl"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="ECL"
            />

            {/* NPF LINE */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="npf"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="NPF"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
