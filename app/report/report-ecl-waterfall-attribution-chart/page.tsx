"use client";

import React, { useState, useEffect } from "react";
import ReportWaterfall from "@/lib/report-ecl-waterfall-attribution-chart/component/ReportWaterfall";
import { WaterfallReportResponse } from "@/lib/report-ecl-waterfall-attribution-chart/types";
import { Download } from "lucide-react";

export default function LaporanEclWaterfallAttributionChartPage() {
  const [data, setData] = useState<WaterfallReportResponse | null>(null);

  useEffect(() => {
    fetch("/api/report/report-ecl-waterfall-attribution-chart")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data laporan");
        return res.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  const handleDownloadExcel = () => {
    window.location.href = "/api/report/report-ecl-waterfall-attribution-chart/export-excel";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="w-full mx-auto space-y-6">
        {/* Header Section like in Image 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
          <h1 className="text-2xl font-black text-black uppercase tracking-wide">
            {data?.namaBank || "PT BANK SYARIAH XYZ"}
          </h1>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-1">
            EXECUTIVE DASHBOARD: ECL WATERFALL ATTRIBUTION CHART (PSAK 413)
          </h2>
          <p className="text-xs font-medium text-slate-700 mt-1 uppercase">
            Laporan Transparansi Pembentukan Cadangan Kerugian
          </p>

          <div className="mt-6 border border-slate-200 rounded-lg bg-slate-50/50 px-8 py-4 text-xs flex flex-col gap-2 min-w-[380px] text-left">
            <div className="flex border-b border-slate-200 pb-2">
              <span className="w-36 text-slate-900 font-bold">Tanggal Posisi Data</span>
              <span className="text-slate-900 font-bold w-4 text-center">:</span>
              <span className="text-slate-900 font-bold">{data?.dataPosition || "-"}</span>
            </div>
            <div className="flex border-b border-slate-200 pb-2">
              <span className="w-36 text-slate-900 font-bold">Masa Observasi</span>
              <span className="text-slate-900 font-bold w-4 text-center">:</span>
              <span className="text-slate-900 font-bold">{data?.dataPosition || "-"} s.d {data?.dataPosition || "-"}</span>
            </div>
            <div className="flex border-b border-slate-200 pb-2">
              <span className="w-36 text-slate-900 font-bold">Diterbitkan Untuk</span>
              <span className="text-slate-900 font-bold w-4 text-center">:</span>
              <span className="text-slate-900 font-bold">Board of Directors (BOD) & KAP Big Four</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-900 font-bold">Sertifikasi Sistem</span>
              <span className="text-slate-900 font-bold w-4 text-center">:</span>
              <span className="text-slate-900 font-bold">Visual Mathematical Integrity Verified</span>
            </div>
          </div>
        </div>

        {/* Filters / Actions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-black uppercase">PERIODE DATA:</span>
            <select className="border border-slate-300 text-slate-900 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium">
              <option>{data?.dataPosition || "31 December 2026"}</option>
            </select>
          </div>
          <button
            onClick={handleDownloadExcel}
            style={{ backgroundColor: data?.themeColorBtnDownload || "#059669" }}
            className="text-white text-xs font-semibold py-2 px-4 rounded-md transition-colors shadow-sm flex items-center gap-2 opacity-90 hover:opacity-100"
          >
            <Download className="w-4 h-4" /> Download Excel
          </button>
        </div>

        {/* Report Content Section */}
        <ReportWaterfall />
      </div>
    </div>
  );
}
