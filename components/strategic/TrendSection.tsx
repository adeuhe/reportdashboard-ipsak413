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
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

type TrendPoint = {
  period: string;
  eclAmount: number; // dalam Miliar
  npfRatio: number; // dalam %
  eclGrowth: number; // dalam %
  npfGrowth: number; // dalam %
};

type Card = {
  label: string;
  value: string;
  note: string;
  tone: "blue" | "red";
};

function cardTone(t: Card["tone"]) {
  return t === "blue"
    ? "bg-sky-50 border-sky-100"
    : "bg-rose-50 border-rose-100";
}

// Formatter rupiah singkat
function formatRupiahShort(val: number) {
  if (val >= 1e12) return (val / 1e12).toFixed(2) + "T";
  if (val >= 1e9) return (val / 1e9).toFixed(2) + "M";
  if (val >= 1e6) return (val / 1e6).toFixed(2) + "Jt";
  return val.toLocaleString("id-ID");
}

// Formatter persen
function formatPercent(val: number) {
  return val.toFixed(2) + "%";
}

export default function TrendSection({
  title,
  subtitle,
  series,
  cards,
}: {
  title: string;
  subtitle: string;
  series: TrendPoint[];
  cards: Card[];
}) {
  // Series ECL diskalakan untuk chart supaya proporsional
  const chartSeries = series.map((d) => ({
    ...d,
    eclAmount: d.eclAmount / 1e9, // tampil di chart dalam Miliar
  }));

  return (
    <div className="px-6 pt-4 pb-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="mt-1 text-xs text-slate-500">{subtitle}</div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={formatRupiahShort}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatPercent}
                tick={{ fontSize: 11 }}
              />
              {/* Tooltip dengan formatter */}
              <Tooltip
                formatter={(value: any, name?: string) => {
                  const key = name ?? "";
                  switch (key) {
                    case "eclAmount":
                      return [formatRupiahShort(value), "ECL Amount"];
                    case "eclGrowth":
                      return [formatPercent(value), "ECL Growth"];
                    case "npfRatio":
                      return [formatRupiahShort(value), "NPF Ratio"];
                    case "npfGrowth":
                      return [formatPercent(value), "NPF Growth"];
                    default:
                      return [value, key];
                  }
                }}
                labelStyle={{ color: "#475569", fontSize: 12, fontWeight: 500 }}
                itemStyle={{ fontSize: 12 }}
              />

              <Legend />
              {/* Amount lines */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="eclAmount"
                stroke="#3b82f6"
                strokeWidth={2}
                dot
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="npfRatio"
                stroke="#ef4444"
                strokeWidth={2}
                dot
              />
              {/* Growth lines (dashed) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="eclGrowth"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="npfGrowth"
                stroke="#f87171"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.label}
              className={`rounded-xl border p-4 ${cardTone(c.tone)}`}
            >
              <div className="text-xs font-semibold text-slate-600">
                {c.label}
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">
                {c.value}
              </div>
              <div className="mt-1 text-xs text-slate-600">{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
