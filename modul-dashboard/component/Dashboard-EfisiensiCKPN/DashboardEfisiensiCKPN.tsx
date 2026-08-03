"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardEfisiensiResponse } from "@/modul-dashboard/services/Dashboard-EfisiensiCKPN/Dashboard-EfisiensiCKPN.service";
import ReportSimulasiTable from "./ReportSimulasiTable";
import CureRatePerformanceChart from "./CureRatePerformanceChart";
import FinancialImpactReportTable from "./FinancialImpactReportTable";

interface Props {
  initialData: DashboardEfisiensiResponse;
}

export default function DashboardEfisiensiCKPN({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const data = initialData?.data;

  // Baseline data awal dari Database (dalam Rupiah & desimal)
  const baseBakiDebetMiliar = data?.bakiDebet
    ? Math.round(data.bakiDebet / 1_000_000_000)
    : 0;

  const baseCureRatePD = data?.cureRatePD
    ? Number((data.cureRatePD * (data.cureRatePD <= 1 ? 100 : 1)).toFixed(2))
    : 0;

  const lgdRatio = (data?.lgdMidHub ?? 0) / 100;

  // STATE SLIDER SIMULASI
  const [eksposur, setEksposur] = useState<number>(baseBakiDebetMiliar);
  const [cureRate, setCureRate] = useState<number>(baseCureRatePD);

  // Sync state ketika filter segment/data props berubah
  useEffect(() => {
    setEksposur(baseBakiDebetMiliar);
    setCureRate(baseCureRatePD);
  }, [baseBakiDebetMiliar, baseCureRatePD]);

  // FORMULA DYNAMIC SIMULASI LIVE
  const eclRatio =
    data?.bakiDebet && data.bakiDebet > 0
      ? (data?.ckpnSavings ?? 0) / data.bakiDebet
      : 0;

  const simCkpnSavingsMiliar = Math.round(
    (eksposur * 1_000_000_000 * eclRatio) / 1_000_000_000,
  );

  const cureRateRatio = cureRate / 100;
  const perkalianCureLgd = lgdRatio > 0 ? cureRateRatio / lgdRatio : 0;

  const simGrafikMerahMiliar = Math.max(
    0,
    Math.round(simCkpnSavingsMiliar - simCkpnSavingsMiliar * perkalianCureLgd),
  );

  const simGrafikHijauMiliar = Math.max(
    0,
    simCkpnSavingsMiliar - simGrafikMerahMiliar,
  );

  const simEfisiensi =
    simCkpnSavingsMiliar > 0
      ? (simGrafikHijauMiliar / simCkpnSavingsMiliar) * 100
      : 0;

  const pctKuningValue =
    eksposur > 0 ? (simCkpnSavingsMiliar / eksposur) * 100 : 0;
  const persentaseKuning = pctKuningValue.toFixed(2);

  const strokeDasharray = 251.32;
  const filledPercentage = Math.min(Math.max(pctKuningValue, 0), 100);
  const strokeDashoffset =
    strokeDasharray - (strokeDasharray * filledPercentage) / 100;

  const totalCadangan = simGrafikMerahMiliar + simGrafikHijauMiliar;
  const persentaseMerah =
    totalCadangan > 0
      ? ((simGrafikMerahMiliar / totalCadangan) * 100).toFixed(1)
      : "0.0";
  const persentaseHijau =
    totalCadangan > 0
      ? ((simGrafikHijauMiliar / totalCadangan) * 100).toFixed(1)
      : "0.0";

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSegment = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (selectedSegment && selectedSegment !== "ALL") {
      params.set("segment", selectedSegment);
    } else {
      params.delete("segment");
    }

    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setEksposur(baseBakiDebetMiliar);
    setCureRate(baseCureRatePD);

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("segment");

    if (initialData?.selectedSegment !== "ALL") {
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <div className="bg-slate-100 p-6 w-full min-h-screen text-gray-800 flex flex-col gap-6 font-sans">
      {/* ==================================================== */}
      {/* HEADER BANNER UNGU (#5A125A)                         */}
      {/* ==================================================== */}
      <div className="bg-[#5A125A] text-white p-4 px-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base md:text-lg font-bold tracking-wide uppercase">
            {initialData?.namaBank || "PT BANK MUAMALAT INDONESIA TBK"}
          </h1>
          <p className="text-xs text-purple-200 mt-0.5">
            CKPN Savings (Efisiensi Pencadangan)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-purple-200 font-medium">Tanggal Laporan:</span>
          <span className="bg-[#420C42] px-3 py-1.5 rounded-lg border border-purple-800/40 font-semibold text-white">
            {initialData?.tanggalLaporan ?? "2025-12-31"}
          </span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* BARIS 1: DASHBOARD VISUAL (SEJAJAR 2 KOLOM)         */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full">
        {/* CARD KIRI: INJEKSI CURE RATE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between w-full h-full">
          <div>
            {/* Header Bar & Segment Filter (Dengan Aksen Border Ungu) */}
            <div className="flex justify-between items-center mb-6">
              <div className="border-l-4 border-[#5A125A] pl-3 py-0.5">
                <h1 className="text-base font-bold text-gray-900 leading-tight">
                  Efisiensi CKPN: Injeksi Cure Rate PD
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tanggal Laporan:{" "}
                  <span className="font-semibold text-gray-700">
                    {initialData?.tanggalLaporan ?? "-"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">
                  Segment:
                </label>
                <select
                  value={initialData?.selectedSegment ?? "ALL"}
                  onChange={handleSegmentChange}
                  className="bg-white border border-gray-300 text-gray-800 text-xs rounded-lg p-2 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                >
                  <option value="ALL">All Segment</option>
                  {initialData?.segmentOptions?.map((opt) => (
                    <option key={opt.Segment} value={opt.Segment}>
                      Segment {opt.Segment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!data ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-semibold text-sm">
                  Data tidak ditemukan untuk segment ini.
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Header Metrics */}
                <div className="flex justify-end gap-8 text-xs mb-4">
                  <div>
                    <span className="block text-gray-400 font-medium">
                      LGD MID HUB
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {(data?.lgdMidHub ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-medium">
                      CKPN SAVINGS
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      Rp {simCkpnSavingsMiliar} M
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-normal">
                      EFISIENSI
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {simEfisiensi.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Main Visual Display Area */}
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-gray-100 mb-6 flex flex-col items-center relative">
                  {/* GRAFIK KUNING */}
                  <div className="relative flex flex-col items-center group cursor-pointer">
                    <div className="w-64 h-32 relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 200 110">
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="22"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke="#B29D38"
                          strokeWidth="22"
                          strokeLinecap="round"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 ease-out"
                        />
                      </svg>

                      <div className="absolute top-12 text-center flex flex-col items-center">
                        <span className="font-bold text-lg text-gray-900">
                          Rp {simCkpnSavingsMiliar} M
                        </span>
                        <span className="bg-amber-100 text-[#857321] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                          {persentaseKuning}%
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between w-72 text-[11px] text-gray-400 mt-1 font-medium">
                      <span>0</span>
                      <span className="text-gray-700 font-semibold">
                        CKPN SAVINGS
                      </span>
                      <span>{eksposur} M</span>
                    </div>
                  </div>

                  <hr className="w-full border-gray-200 my-6" />

                  {/* DONUT CHARTS */}
                  <div className="flex justify-around w-full max-w-lg mb-2">
                    {/* Cadangan (Merah) */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-36 h-36 relative flex items-center justify-center">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#E5E7EB"
                            strokeWidth="12"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#B91C1C"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray="251.32"
                            strokeDashoffset={
                              251.32 - (251.32 * Number(persentaseMerah)) / 100
                            }
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="block font-bold text-sm text-gray-800">
                            Rp {simGrafikMerahMiliar} M
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Cadangan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total Efisiensi (Hijau) */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-36 h-36 relative flex items-center justify-center">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#E5E7EB"
                            strokeWidth="12"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#15803D"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray="251.32"
                            strokeDashoffset={
                              251.32 - (251.32 * Number(persentaseHijau)) / 100
                            }
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="block font-bold text-sm text-gray-800">
                            Rp {simGrafikHijauMiliar} M
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Total Efisiensi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-lg text-right pr-6 text-xs font-bold text-gray-800">
                    Hemat: Rp {simCkpnSavingsMiliar} M
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sliders Control & Reset */}
          {data && (
            <div>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                  <span className="whitespace-nowrap">
                    Eksposur Stage 2 (M)
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={baseBakiDebetMiliar * 2 || 20000}
                    value={eksposur}
                    onChange={(e) => setEksposur(Number(e.target.value))}
                    className="w-full accent-[#5A125A] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="bg-white border border-gray-300 rounded-xl px-2 py-1 font-bold text-gray-800 min-w-[45px] text-center shadow-sm">
                    {eksposur}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                  <span className="whitespace-nowrap">
                    Injeksi Cure Rate (%)
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.01"
                    value={cureRate}
                    onChange={(e) => setCureRate(Number(e.target.value))}
                    className="w-full accent-[#5A125A] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="bg-white border border-gray-300 rounded-xl px-2 py-1 font-bold text-gray-800 min-w-[55px] text-center shadow-sm">
                    {cureRate.toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Reset Data
              </button>
            </div>
          )}
        </div>

        {/* CARD KANAN: GRAFIK AKAD */}
        <div className="w-full h-full flex flex-col justify-between items-stretch">
          <div className="flex-1 flex flex-col [&>div]:h-full [&>div]:flex [&>div]:flex-col [&>div]:justify-between">
            <CureRatePerformanceChart
              data={initialData?.cureRatePerformanceData || []}
            />
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* BARIS 2: REPORTS & TABLES (SEJAJAR ATAS PRESISI)    */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* TABEL AUDIT LGD (KIRI) */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <ReportSimulasiTable
            data={initialData?.reportSimulasiData || []}
            currentCureRateSlider={cureRate}
          />
        </div>

        {/* TABEL FINANSIAL IMPACT (KANAN) */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <FinancialImpactReportTable
            currentCureRateSlider={cureRate}
            currentEksposurSlider={eksposur}
          />
        </div>
      </div>
    </div>
  );
}