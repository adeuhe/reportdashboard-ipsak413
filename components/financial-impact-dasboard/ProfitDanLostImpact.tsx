"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, Sparkles } from "lucide-react";

interface FinancialImpactProps {
  data: {
    trendData: { month: string; impact: number; target: number }[];
    distributionData: { name: string; value: number }[];
    ratios: { car: number; npl: number };
    insight: { isCritical: boolean; title: string; message: string };
    netProfitMargin?: string | number;
  };
  reportDate?: string | Date;
}
const formatRupiah = (val: number) => {
  const absVal = Math.abs(val);

  const truncate = (num: number) =>
    num < 0 ? Math.ceil(num * 100) / 100 : Math.floor(num * 100) / 100;

  if (absVal >= 1_000_000_000_000_000_000) {
    return `Rp ${truncate(val / 1_000_000_000_000_000_000).toLocaleString(
      "id-ID",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )} Kuintiliun`;
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

const formatPercent = (val: number, decimalPlaces: number = 2) => {
  if (isNaN(val)) return "0";

  const factor = Math.pow(10, decimalPlaces);

  // Truncate (bukan rounding)
  const truncated =
    val < 0
      ? Math.ceil(val * factor) / factor
      : Math.floor(val * factor) / factor;

  // Pisahkan integer & decimal
  const parts = truncated.toString().split(".");
  const integerPart = parseInt(parts[0]).toLocaleString("id-ID");

  let decimalPart = parts[1] || "";

  // Pastikan panjang desimal sesuai
  if (decimalPlaces > 0) {
    decimalPart = decimalPart
      .padEnd(decimalPlaces, "0")
      .slice(0, decimalPlaces);
    return `${integerPart},${decimalPart}`;
  }

  return integerPart;
};

// const formatRupiah = (value: number) => {
//   const formatter = new Intl.NumberFormat("id-ID");

//   if (value >= 1_000_000_000) {
//     return `Rp ${formatter.format(value / 1_000_000_000)} Miliar`;
//   }
//   if (value >= 1_000_000) {
//     return `Rp ${formatter.format(value / 1_000_000)} Juta`;
//   }
//   return `Rp ${formatter.format(value)}`;
// };

const formatFullDate = (dateSource?: string | Date) => {
  if (!dateSource) return "Data tanggal tidak tersedia";
  const d = new Date(dateSource);
  // Menggunakan locale id-ID untuk Bahasa Indonesia
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProfitDanLostImpact({
  data,
  reportDate,
}: FinancialImpactProps) {
  const totalEclValue = data.distributionData.reduce(
    (acc, curr) => acc + curr.value,
    0,
  );
  console.log("Log Data", data);

  // Data untuk Bar Chart (ECL Charge bulan ini)
  const eclData = [{ name: "Beban ECL", value: totalEclValue }];

  // Urutan: Komersial (Oranye), Konsumer (Biru), Mikro (Merah), Ritel (Hijau)
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  // 1. Ambil nilai margin dan konversi ke number
  const marginValue = parseFloat(data.netProfitMargin?.toString() || "0");

  // 3. Kalkulasi SVG (Pastikan variabel ini sudah ada)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const truncate = (num: number, decimal: number = 2): number => {
    if (isNaN(num)) return 0;

    const factor = Math.pow(10, decimal);
    return num < 0
      ? Math.ceil(num * factor) / factor
      : Math.floor(num * factor) / factor;
  };
  const safeMargin = truncate(marginValue, 2);
  const dashOffset =
    circumference - (circumference * Math.min(safeMargin, 100)) / 100;

const getRiskInfo = (value: number) => {
  if (value <= 20) {
    return {
      label: "Baik",
      desc: "ECL masih rendah",
      color: "text-green-600",
      stroke: "#22c55e",
    };
  }

  if (value <= 40) {
    return {
      label: "Perlu perhatian",
      desc: "ECL mulai signifikan",
      color: "text-yellow-500",
      stroke: "#eab308",
    };
  }

  if (value <= 60) {
    return {
      label: "Risiko tinggi",
      desc: "ECL cukup besar",
      color: "text-orange-500",
      stroke: "#f97316",
    };
  }

  return {
    label: "Risiko sangat tinggi",
    desc: "Laba banyak tergerus",
    color: "text-red-600",
    stroke: "#ef4444",
  };
};

const risk = getRiskInfo(safeMargin);

const strokeColor = risk.stroke;
  return (
    <div className="bg-white text-black p-6 rounded-xl border border-slate-700 shadow-xl font-sans space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          {/* Diubah jadi text-black font-black */}
          <h2 className="text-lg font-black text-black flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Dampak Laba & Rugi (P&L)
          </h2>
          {/* Tanggal diubah jadi text-black font-bold */}
          <p className="text-black font-bold text-sm mt-1">
            {formatFullDate(reportDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Estimasi Dampak P&L */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between h-[180px]">
          {/* Diubah jadi text-black font-black */}
          <h3 className="text-black text-xs font-black uppercase tracking-wider">
            Estimasi Dampak P&L
          </h3>
          <div className="flex items-end justify-between gap-4">
            <div className="pb-2">
              {/* Label diubah jadi text-black font-black */}
              <p className="text-[10px] text-black mb-1 font-black uppercase">
                Beban ECL (CKPN) Bulan Ini
              </p>
              {/* Nilai nominal diubah jadi text-black font-black */}
              <h4 className="text-3xl font-black text-black">
                {formatRupiah(totalEclValue)}
              </h4>
            </div>
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eclData}>
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <XAxis dataKey="name" hide />
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(value)]}
                    // Tooltip styling diubah agar isinya hitam dan tebal
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#000", fontWeight: "900" }}
                    labelStyle={{ color: "#000", fontWeight: "900" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Box 2: Margin Laba Bersih */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between h-[180px]">
          {/* Judul tetap Hitam Pekat */}
          <h3 className="text-black text-xs font-black uppercase tracking-wider">
            Persentase ECL Terhadap Laba
          </h3>

          <div className="flex flex-1 items-center justify-center relative">
            {/* Ukuran SVG sedikit diperbesar agar menampung stroke yang tebal */}
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Lingkaran Background (Abu-abu) */}
              <circle
                cx="64"
                cy="64"
                r="48" /* Radius disesuaikan */
                stroke="#e2e8f0"
                strokeWidth="20" /* DITEBALKAN dari 8 ke 20 */
                fill="transparent"
              />
              {/* Lingkaran Progress (Dinamis) */}
              <circle
                cx="64"
                cy="64"
                r="48" /* Harus sama dengan radius bg agar tumpang tindih sempurna */
                stroke={strokeColor}
                strokeWidth="20" /* DITEBALKAN agar sama dengan background */
                fill="transparent"
                strokeDasharray={
                  2 * Math.PI * 48
                } /* Pastikan keliling dihitung ulang jika r berubah */
                strokeDashoffset={dashOffset}
                strokeLinecap="butt" /* Menggunakan 'butt' agar ujungnya rata seperti donut chart Recharts */
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Teks persentase di tengah tetap Hitam Pekat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-black">
                {formatPercent(safeMargin)}%
              </span>

              <span className={`text-[10px] font-bold ${risk.color}`}>
                {risk.label}
              </span>

              <span className="text-[9px] text-slate-500 text-center px-2">
                {risk.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Box 3: Tren Profit */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-[220px]">
          {/* Diubah jadi text-black font-black */}
          <h3 className="text-black text-xs font-black mb-4 uppercase tracking-wider">
            Tren Laba (6 Bulan Terakhir)
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.trendData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                {/* BAGIAN YANG DIPERBAIKI */}
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#000000", fontSize: 12, fontWeight: "900" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0} // <--- Ditambahkan agar semua label dipaksa tampil
                  padding={{ left: 20, right: 20 }} // <--- Ditambahkan agar label ujung tidak terpotong tepi container
                />

                <Line
                  type="monotone"
                  dataKey="impact"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#ef4444" }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  // Menambahkan styling hitam tebal untuk label dan item di tooltip
                  labelStyle={{
                    color: "#000",
                    fontWeight: "900",
                    marginBottom: "4px",
                  }}
                  itemStyle={{ color: "#000", fontWeight: "900" }}
                  labelFormatter={(label) => {
                    const monthMap: Record<string, string> = {
                      Jan: "Januari",
                      Feb: "Februari",
                      Mar: "Maret",
                      Apr: "April",
                      May: "Mei",
                      Jun: "Juni",
                      Jul: "Juli",
                      Aug: "Agustus",
                      Sep: "September",
                      Oct: "Oktober",
                      Nov: "November",
                      Dec: "Desember",
                    };
                    return `Bulan: ${monthMap[label] || label}`;
                  }}
                  formatter={(value: any) => [formatRupiah(value), "Dampak"]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Box 4: Distribusi Unit Bisnis */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col h-[220px]">
          {/* Diubah jadi text-black font-black */}
          <h3 className="text-black text-xs font-black mb-2 uppercase tracking-wider">
            Distribusi Unit Bisnis (Segmentasi)
          </h3>
          <div className="flex flex-1 items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distributionData}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                  >
                    {data.distributionData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  {/* Styling Tooltip hitam tebal */}
                  <Tooltip
                    formatter={(value: any) => formatRupiah(value)}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#000", fontWeight: "900" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 pl-4 border-l border-slate-200 overflow-y-auto max-h-[140px]">
              {data.distributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></div>
                  {/* Diubah jadi text-black font-black */}
                  <span
                    className="text-[10px] font-black text-black truncate"
                    title={d.name}
                  >
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insight / Warning */}
      {/* <div
        className={`p-5 rounded-xl border flex gap-4 items-start ${
          data.insight.isCritical
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <div
          className={`p-2 rounded-lg shrink-0 ${data.insight.isCritical ? "bg-red-600" : "bg-blue-600"}`}
        >
          <AlertTriangle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h4
            className={`font-black mb-1 text-sm ${data.insight.isCritical ? "text-red-700" : "text-blue-700"}`}
          >
            Wawasan & Peringatan CFO:
          </h4>
          <p className="text-sm font-bold text-black leading-relaxed italic">
            "{data.insight.message}"
          </p>
        </div>
        <Sparkles size={18} className="text-slate-400 mt-1 shrink-0" />
      </div> */}
    </div>
  );
}
