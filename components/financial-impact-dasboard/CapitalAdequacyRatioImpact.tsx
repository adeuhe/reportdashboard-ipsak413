"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Info, TrendingUp, TrendingDown } from "lucide-react";

type Scenario = "Optimis" | "Baseline" | "Pesimis";

interface CARImpactProps {
  data: {
    eclValues: { Optimis: number; Baseline: number; Pesimis: number };
    modalAwal: number;
    rwaAwal: number;
    trendData: { month: string; value: number }[];
  };
}

export default function CapitalAdequacyRatioImpact({ data }: CARImpactProps) {
  const [mounted, setMounted] = useState(false);
  const [simulation, setSimulation] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("Baseline");

  const [inputEcl, setInputEcl] = useState<number>(data.eclValues.Baseline);
  const [inputRwa, setInputRwa] = useState<number>(data.rwaAwal);
  const [inputModal, setInputModal] = useState<number>(data.modalAwal);
  const [manualEclEnabled, setManualEclEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveEcl = useMemo(() => {
    if (!simulation) return Number(data.eclValues.Baseline) || 0;
    if (manualEclEnabled) return Number(inputEcl) || 0;
    switch (scenario) {
      case "Optimis":
        return Number(data.eclValues.Optimis) || 0;
      case "Pesimis":
        return Number(data.eclValues.Pesimis) || 0;
      case "Baseline":
      default:
        return Number(data.eclValues.Baseline) || 0;
    }
  }, [simulation, manualEclEnabled, inputEcl, scenario, data.eclValues]);

  useEffect(() => {
    if (!simulation) {
      setScenario("Baseline");
      setManualEclEnabled(false);
      setInputEcl(data.eclValues.Baseline);
      setInputRwa(data.rwaAwal);
      setInputModal(data.modalAwal);
    }
  }, [simulation, data.eclValues.Baseline, data.rwaAwal, data.modalAwal]);

  const currentCar = useMemo(() => {
    const rwa = Number(inputRwa);
    const modal = Number(inputModal);
    const ecl = Number(effectiveEcl);
    if (rwa === 0) return 0;
    const res = ((modal - ecl) / rwa) * 100;
    return parseFloat(res.toFixed(2));
  }, [effectiveEcl, inputRwa, inputModal]);

  const trendInfo = useMemo(() => {
    const trendData = data.trendData || [];
    if (trendData.length < 2) return { isUp: true, diff: 0 };
    const last = trendData[trendData.length - 1].value;
    const prev = trendData[trendData.length - 2].value;
    const diff = parseFloat((last - prev).toFixed(2));
    return { isUp: diff >= 0, diff: Math.abs(diff) };
  }, [data.trendData]);

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

  const formatInputDisplay = (val: number) =>
    `Rp ${Math.floor(val).toLocaleString("id-ID")}`;
  const parseInputValue = (val: string) => Number(val.replace(/\D/g, ""));

  if (!mounted)
    return <div className="min-h-[600px] bg-white animate-pulse rounded-xl" />;

  const isWarning = currentCar < 15;

  return (
    <div className="bg-white text-slate-900 p-6 pb-12 rounded-xl border border-slate-700 shadow-xl font-sans space-y-8 mb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b pb-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Capital Adequacy Ratio Impact Analysis
          </h2>
          <p className="text-sm font-bold text-black mt-1 pl-4">
            Simulasi Kecukupan Modal & Dampak ECL
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
              Mode Simulasi
            </span>
            <button
              onClick={() => setSimulation(!simulation)}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                simulation
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                  simulation ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-2">
            {(["Optimis", "Baseline", "Pesimis"] as Scenario[]).map((s) => (
              <button
                key={s}
                disabled={!simulation}
                onClick={() => {
                  setScenario(s);
                  setManualEclEnabled(false);
                }}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg border transition-all ${
                  !simulation
                    ? "opacity-30 cursor-not-allowed"
                    : scenario === s
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid - Diubah ke stretch agar tinggi sama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Kolom Kiri: ECL & Modal */}
        <div className="flex flex-col gap-4">
          <div
            className={`p-5 rounded-2xl border-2 flex-1 flex flex-col justify-center transition-all ${
              simulation
                ? "bg-white border-blue-500 shadow-lg"
                : "bg-slate-50 border-transparent"
            }`}
          >
            <label className="text-[10px] font-black text-black uppercase tracking-widest mb-3 block">
              Total ECL Charge
            </label>
            {simulation ? (
              <>
                <input
                  type="text"
                  value={formatInputDisplay(
                    manualEclEnabled ? Number(inputEcl) : Number(effectiveEcl),
                  )}
                  onChange={(e) => {
                    setManualEclEnabled(true);
                    setInputEcl(parseInputValue(e.target.value));
                  }}
                  className="w-full text-2xl font-black text-red-600 bg-transparent outline-none border-b-2 border-red-100 focus:border-red-500"
                />
                {manualEclEnabled && (
                  <button
                    type="button"
                    className="mt-2 text-[10px] font-bold text-blue-600 underline text-left"
                    onClick={() => setManualEclEnabled(false)}
                  >
                    Reset ke angka Aktual Database
                  </button>
                )}
              </>
            ) : (
              <h3 className="text-2xl font-black text-slate-800">
                {formatCurrencyDinamis(Number(effectiveEcl))}
              </h3>
            )}
            <p className="text-[9px] mt-2 font-bold text-black italic">
              Skenario: {scenario}{" "}
              {manualEclEnabled ? "(Input Manual)" : "(Hitungan DB)"} • ECL
              efektif: {formatCurrencyDinamis(Number(effectiveEcl))}
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border-2 flex-1 flex flex-col justify-center transition-all ${
              simulation
                ? "bg-white border-blue-500 shadow-lg"
                : "bg-slate-50 border-transparent"
            }`}
          >
            <label className="text-[10px] font-black text-black uppercase tracking-widest mb-3 block">
              Total Modal
            </label>
            {simulation ? (
              <input
                type="text"
                value={formatInputDisplay(inputModal)}
                onChange={(e) => setInputModal(parseInputValue(e.target.value))}
                className="w-full text-2xl font-black text-emerald-600 bg-transparent outline-none border-b-2 border-emerald-100 focus:border-emerald-500"
              />
            ) : (
              <h3 className="text-2xl font-black text-slate-800">
                {formatCurrencyDinamis(Number(inputModal))}
              </h3>
            )}
          </div>
        </div>

        {/* Kolom Tengah: Gauge Chart Section */}
        <div className="flex flex-col items-center justify-center relative pt-4 min-h-[250px]">
          <div className="relative w-[280px] h-[140px] flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <defs>
                <linearGradient
                  id="gaugeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={isWarning ? "#fee2e2" : "#d1fae5"}
                  />
                  <stop
                    offset="100%"
                    stopColor={isWarning ? "#ef4444" : "#10b981"}
                  />
                </linearGradient>
              </defs>
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="35"
                strokeLinecap="butt"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="35"
                strokeLinecap="butt"
                strokeDasharray="251.2"
                strokeDashoffset={
                  251.2 - (251.2 * Math.min(Math.max(currentCar, 0), 100)) / 100
                }
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div
              className="absolute bottom-[13px] left-1/2 flex items-end justify-center pointer-events-none transition-transform duration-1000 ease-[cubic-bezier(0.2,0,0,1)]"
              style={{
                width: "4px",
                height: "100px",
                transform: `translateX(-50%) rotate(${(Math.min(Math.max(currentCar, 0), 100) / 100) * 180 - 90}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div className="relative flex flex-col items-center h-full justify-end">
                <div className="w-[4px] h-[80px] bg-slate-800 rounded-t-sm shadow-lg" />
                <div className="absolute -bottom-2 w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow-sm z-10" />
              </div>
            </div>
          </div>
          <div className="text-center mt-4 z-20">
            <h2
              className={`text-5xl font-black tracking-tighter transition-colors duration-500 ${isWarning ? "text-red-600" : "text-emerald-600"}`}
            >
              {currentCar}%
            </h2>
            <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">
              Calculated CAR Ratio
            </p>
          </div>
          {isWarning && (
            <div className="mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-full flex items-center gap-2 animate-bounce">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-[10px] font-black text-red-700 uppercase whitespace-nowrap">
                Below Threshold (15%)
              </span>
            </div>
          )}
        </div>

        {/* Kolom Kanan: RWA & Tren CAR */}
        <div className="flex flex-col gap-4">
          {/* Card RWA */}
          <div
            className={`p-5 rounded-2xl border-2 flex-1 flex flex-col justify-center transition-all ${
              simulation
                ? "bg-white border-blue-500 shadow-lg"
                : "bg-slate-50 border-transparent"
            }`}
          >
            <label className="text-[10px] font-black text-black uppercase tracking-widest mb-3 block text-center">
              RWA (Aset Berisiko)
            </label>
            {simulation ? (
              <input
                type="text"
                value={formatInputDisplay(inputRwa)}
                onChange={(e) => setInputRwa(parseInputValue(e.target.value))}
                className="w-full text-2xl font-black text-center text-blue-600 bg-transparent outline-none border-b-2 border-blue-100 focus:border-blue-500"
              />
            ) : (
              <h3 className="text-2xl font-black text-slate-800 text-center">
                {formatCurrencyDinamis(Number(inputRwa))}
              </h3>
            )}
            <div className="mt-4 flex items-center justify-center gap-2 text-black text-center">
              <Info size={12} />
              <span className="text-[9px] text-black font-bold italic">
                Parameter Eksternal
              </span>
            </div>
          </div>

          {/* Card Trend CAR 3D/Bayangan */}
          <div className="p-4 rounded-2xl border-2 border-transparent bg-slate-50 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-black uppercase tracking-widest">
                Trend CAR (6 Bulan)
              </label>
              <div
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  trendInfo.isUp
                    ? "text-emerald-700 bg-emerald-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {trendInfo.isUp ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {trendInfo.diff}%
              </div>
            </div>

            <div className="flex-1 w-full relative min-h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.trendData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: "bold" }}
                    dy={5}
                    interval={0}
                    padding={{ left: 15, right: 15 }}
                  />
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ color: "#0ea5e9", fontWeight: "900" }}
                    labelStyle={{
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                    // Opsi tambahan untuk mempercantik tooltip jika dibutuhkan
                    formatter={(value: any) => [`${value}%`]}
                  />
                  {/* PERBAIKAN: Menambahkan name="CAR" agar tooltip tidak menampilkan "value" */}
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="CAR"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Footer */}
      <div
        className={`p-6 rounded-2xl flex gap-5 items-start transition-colors duration-500 mt-8 ${
          isWarning
            ? "bg-slate-900 border-l-8 border-red-600"
            : "bg-slate-900 border-l-8 border-emerald-600"
        }`}
      >
        <div
          className={`p-3 rounded-xl shrink-0 ${
            isWarning ? "bg-red-600" : "bg-emerald-600"
          } text-white shadow-lg`}
        >
          <AlertTriangle size={24} />
        </div>

        <div className="space-y-1">
          <h4 className="font-black text-sm uppercase tracking-widest text-white">
            Masukan & Peringatan CFO
          </h4>
          <p className="text-[13px] text-white leading-relaxed font-medium">
            {isWarning
              ? `PERINGATAN: Posisi CAR simulasi (${currentCar}%) berada di bawah limit internal 15%. Hal ini dipicu oleh besarnya nilai ECL pada skenario ${scenario}. Diperlukan evaluasi terhadap portofolio aset.`
              : `POSISI AMAN: Rasio CAR (${currentCar}%) masih memadai untuk menyerap risiko pada skenario ${scenario}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
