"use client";

import React, { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Types ---
type Props = {
  data: {
    trendData: { month: string; impact: number; target: number }[];
    distributionData: { name: string; value: number }[];
    ratios: {
      car: number;
      npl: number;
    };
    insight: {
      isCritical: boolean;
      message: string;
      title: string;
    };
  };
};

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

// --- Helpers & Icons ---

const formatRupiahShort = (value: number) => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000)
    return `Rp ${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${value.toLocaleString()}`;
};

const formatCurrencyDinamis = (val: number) => {
  const absVal = Math.abs(val);

  const truncate = (num: number) =>
    num < 0
      ? Math.ceil(num * 100) / 100
      : Math.floor(num * 100) / 100;

  if (absVal >= 1_000_000_000_000_000_000) {
    return `Rp ${truncate(val / 1_000_000_000_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Kuintiliun`;
  } else if (absVal >= 1_000_000_000_000_000) {
    return `Rp ${truncate(val / 1_000_000_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Kuadriliun`;
  } else if (absVal >= 1_000_000_000_000) {
    return `Rp ${truncate(val / 1_000_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Triliun`;
  } else if (absVal >= 1_000_000_000) {
    return `Rp ${truncate(val / 1_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Miliar`;
  } else if (absVal >= 1_000_000) {
    return `Rp ${truncate(val / 1_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Juta`;
  } else {
    return `Rp ${val.toLocaleString("id-ID")}`;
  }
};

const CustomRocketDot = (props: any) => {
  const { cx, cy, index, dataLength } = props;
  if (index === dataLength - 1) {
    return (
      <svg
        x={cx - 12}
        y={cy - 12}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-orange-500 drop-shadow-md animate-pulse"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
      </svg>
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="white"
      stroke="#f59e0b"
      strokeWidth={2}
    />
  );
};

const GaugeChart = ({
  value,
  label,
  isInverse = false,
}: {
  value: number;
  label: string;
  isInverse?: boolean;
}) => {
  let color = "#10b981";
  if (!isInverse) {
    if (value < 10) color = "#ef4444";
    else if (value < 15) color = "#f59e0b";
  } else {
    if (value > 5) color = "#ef4444";
    else if (value > 3) color = "#f59e0b";
  }

  const data = [
    { name: "Score", value: value },
    { name: "Rest", value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="w-[100px] h-[50px] relative">
        <ResponsiveContainer width="100%" height="200%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={35}
              outerRadius={50}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell key="score" fill={color} />
              <Cell key="rest" fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* BAGIAN YANG DIPERBAIKI: Mengeluarkan teks ini dari relative div di atas */}
      <div className="w-full text-center mt-1">
        {/* Ubah font jadi black murni dan lebih tebal */}
        <span className="text-lg font-black text-black">{value}%</span>
      </div>
      {/* Ubah label jadi hitam dan tebal */}
      <span className="text-[10px] font-bold text-black text-center leading-tight px-1">
        {label}
      </span>
    </div>
  );
};

export default function FinancialDashboardClient({ data }: Props) {
  // Logic Speedometer Header (Comparison)
  const summary = useMemo(() => {
    if (!data.trendData || data.trendData.length < 2) {
      return { percent: 0, text: "0%", isIncrease: false };
    }

    // Ambil 2 data terakhir
    const lastIndex = data.trendData.length - 1;
    const currentMonth = data.trendData[lastIndex].impact;
    const prevMonth = data.trendData[lastIndex - 1].impact;

    let momPercent = 0;
    if (prevMonth !== 0) {
      momPercent = ((currentMonth - prevMonth) / prevMonth) * 100;
    } else {
      momPercent = currentMonth > 0 ? 100 : 0;
    }

    const isIncrease = momPercent > 0;

    return {
      percent: Math.min(Math.abs(momPercent), 100),
      text: `${isIncrease ? "+" : ""}${momPercent.toFixed(1)}%`,
      isIncrease,
    };
  }, [data.trendData]);

  const gaugeData = [
    { name: "Score", value: summary.percent },
    { name: "Rest", value: 100 - summary.percent },
  ];
  const gaugeColor = summary.isIncrease ? "#ef4444" : "#10b981";

  return (
    <div className="w-full pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =========================================================
            CARD 1 (KIRI - Besar): ECL TREND CHART + ALERT
        ========================================================= */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-700 shadow-sm flex flex-col h-full">
          {/* A. Header Card Kiri */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-black flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Dampak Keuangan ECL
              </h2>
              <p className="text-sm font-bold text-black mt-1 pl-4">
                Dampak Aktual Bulanan (6 Bulan Terakhir).
              </p>
            </div>
            {/* Speedometer Mini di Header */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2 border border-slate-100 pr-4">
              <div className="w-[50px] h-[25px] relative">
                <ResponsiveContainer width="100%" height="200%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={15}
                      outerRadius={25}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell key="score" fill={gaugeColor} />
                      <Cell key="rest" fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col">
                {/* Diubah jadi hitam tebal */}
                <span className="text-[10px] text-black font-bold uppercase tracking-wide leading-tight">
                  ECL Movement (MoM)
                </span>
                <span
                  className={`text-sm font-black leading-none mt-0.5 ${summary.isIncrease ? "text-red-600" : "text-green-600"}`}
                >
                  {summary.text}
                  <span className="text-[10px] ml-1 font-bold text-black">
                    {summary.isIncrease ? "▲" : "▼"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* B. Chart Section */}
          <div className="p-6 flex-1">
            <div className="flex justify-end mb-2">
              {/* Legend */}
              <div className="flex gap-4 text-xs">
                {/* Diubah jadi hitam tebal */}
                <div className="flex items-center gap-1.5 text-black font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>{" "}
                  ECL Actual
                </div>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data.trendData}
                  margin={{ top: 10, right: 10, left: 40, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    // 👇 Diubah jadi hitam dan tebal
                    tick={{ fill: "#000000", fontSize: 12, fontWeight: "bold" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    // 👇 Diubah jadi hitam dan tebal
                    tick={{ fill: "#000000", fontSize: 12, fontWeight: "bold" }}
                    tickFormatter={(val) => formatRupiahShort(val)}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={({ active, payload, label }) => {
                      // Cek kalau tooltip lagi aktif dan ada datanya
                      if (active && payload && payload.length) {
                        // Ambil data pertama aja (index 0) biar valuenya ga double
                        const data = payload[0];

                        return (
                          <div
                            className="bg-white rounded-lg p-3"
                            style={{
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          >
                            {/* Label Tanggal/Bulan - Hitam Tebal */}
                            <p className="text-black font-bold text-xs mb-1">
                              {label}
                            </p>
                            {/* Nilai ECL - Hitam Tebal */}
                            <p className="text-black font-bold text-sm m-0">
                              ECL Amount:{" "}
                              {formatCurrencyDinamis(Number(data.value))}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="impact"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={36}
                    activeBar={{ fill: "#2563eb" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="impact"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    // dot={(props) => (
                    //   <CustomRocketDot
                    //     {...props}
                    //     dataLength={data.trendData.length}
                    //   />
                    // )}
                    dot={{ r: 4, fill: "#f59e0b" }}
                    activeDot={{ r: 6, fill: "#f59e0b" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C. Footer: ALERT / INSIGHT SECTION (Integrated) */}
          <div className="bg-white p-6 border-t border-gray-100 rounded-b-xl">
            <div
              className={`flex items-start gap-4 p-2 rounded-xl border ${
                data.insight.isCritical
                  ? "bg-red-50 border-red-100"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              {/* Icon */}
              <div
                className={`mt-1 flex-shrink-0 ${data.insight.isCritical ? "text-red-600" : "text-emerald-600"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              {/* Text Content */}
              <div>
                <h4
                  className={`text-sm font-black mb-1 ${data.insight.isCritical ? "text-red-800" : "text-emerald-800"}`}
                >
                  {data.insight.title}
                </h4>
                <p
                  className={`text-sm font-bold leading-relaxed ${data.insight.isCritical ? "text-red-800" : "text-emerald-800"}`}
                >
                  {data.insight.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            CARD 2 (KANAN - Kecil): PIE CHART + RATIOS
        ========================================================= */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-700 shadow-sm flex flex-col h-full">
          {/* A. Header Card Kanan */}
          <div className="px-5 py-5 border-b border-slate-100">
            <h2 className="text-lg font-black text-black flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-400 rounded-full"></span>
              Dampak Distribusi
            </h2>
            <p className="text-sm font-bold text-black mt-1 pl-4">
              Rincian ECL berdasarkan Segment
            </p>
          </div>

          {/* B. Pie Chart Section */}
          <div className="p-2 flex-1 flex flex-col items-center justify-center relative">
            {/* Label Tengah - Diposisikan benar-benar di center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                {/* Diubah jadi hitam pekat dan font-black */}
                <span className="text-[10px] text-black font-black uppercase leading-tight">
                  Total
                  <br />
                  Exposure
                </span>
              </div>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distributionData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.distributionData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) =>
                      formatCurrencyDinamis(Number(value))
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      fontWeight: "bold", // Menambah tebal
                      color: "#000000", // Menambah hitam
                    }}
                    itemStyle={{
                      color: "#000000",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={6}
                    layout="horizontal"
                    align="center"
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      bottom: 0,
                      marginTop: "-10px",
                    }}
                    formatter={(value) => (
                      <span style={{ color: "#000000" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* C. Footer: FINANCIAL RATIOS (Integrated) */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            <div className="mb-3 flex items-center justify-between">
              {/* Diubah jadi hitam tebal */}
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                Indikator Utama
              </h3>
            </div>

            {/* 2 Speedometer berdampingan */}
            <div className="flex items-center justify-between gap-2">
              <GaugeChart
                value={data.ratios.car}
                label="Capital Adequacy Ratio"
              />
              <div className="w-px h-10 bg-slate-300"></div>
              <GaugeChart
                value={data.ratios.npl}
                label="NPF Alert Level"
                isInverse={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
