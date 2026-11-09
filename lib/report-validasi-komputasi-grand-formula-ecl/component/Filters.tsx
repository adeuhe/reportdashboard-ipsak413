"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { SegmentOption, AkadOption } from "../types";
import LoadingOverlay from "./LoadingOverlay";

interface FiltersProps {
  startDate: string;
  endDate: string;
  selectedSegment?: string;
  selectedAkad?: string;
  segmentList?: SegmentOption[];
  akadList?: AkadOption[];
  themeColorBtnDownload: string;
  themeColorBtnFilterReport: string;
}

export default function Filters({
  startDate,
  endDate,
  selectedSegment = "ALL",
  selectedAkad = "ALL",
  segmentList = [],
  akadList = [],
  themeColorBtnDownload,
  themeColorBtnFilterReport,
}: FiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = isPending || isSubmitting;

  const [stDate, setStDate] = useState(startDate);
  const [edDate, setEdDate] = useState(endDate);
  const [seg, setSeg] = useState(selectedSegment);
  const [akd, setAkd] = useState(selectedAkad);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setStDate(startDate);
    setEdDate(endDate);
    setSeg(selectedSegment || "ALL");
    setAkd(selectedAkad || "ALL");
    setIsSubmitting(false);
  }, [startDate, endDate, selectedSegment, selectedAkad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsSubmitting(true);
    const params = new URLSearchParams();
    if (stDate) params.set("startDate", stDate);
    if (edDate) params.set("endDate", edDate);
    if (seg && seg !== "ALL") params.set("segment", seg);
    if (akd && akd !== "ALL") params.set("akad", akd);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/report/report-validasi-komputasi-grand-formula-ecl?${params.toString()}`);
    });
  };

  const handleDownloadExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      const params = new URLSearchParams();
      if (stDate) params.set("startDate", stDate);
      if (edDate) params.set("endDate", edDate);
      if (seg && seg !== "ALL") params.set("segment", seg);
      if (akd && akd !== "ALL") params.set("akad", akd);

      const res = await fetch(`/api/report/report-validasi-komputasi-grand-formula-ecl/export-excel?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal mendownload excel");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Validasi_Komputasi_ECL_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading excel:", err);
      alert("Gagal mendownload Excel, silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <LoadingOverlay
        show={isLoading}
        title="Menerapkan Filter Validasi ECL..."
        subtitle="Mohon tunggu, sistem sedang memproses query kalkulasi formula ECL dan memuat data dari database."
      />

      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          
          {/* Left Side: Filter Form */}
          <form 
            onSubmit={handleSubmit}
            className="flex flex-wrap items-end gap-3 w-full md:w-auto"
          >
            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                TANGGAL MULAI:
              </label>
              <input
                type="date"
                name="startDate"
                disabled={isLoading}
                value={stDate}
                onChange={(e) => setStDate(e.target.value)}
                className="border-2 border-slate-400 text-slate-900 font-black text-xs rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-slate-700 shadow-sm h-[38px] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                TANGGAL SELESAI:
              </label>
              <input
                type="date"
                name="endDate"
                disabled={isLoading}
                value={edDate}
                onChange={(e) => setEdDate(e.target.value)}
                className="border-2 border-slate-400 text-slate-900 font-black text-xs rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-slate-700 shadow-sm h-[38px] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Segment Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                SEGMENT:
              </label>
              <select
                name="segment"
                disabled={isLoading}
                value={seg}
                onChange={(e) => setSeg(e.target.value)}
                className="border-2 border-slate-400 text-slate-900 font-bold text-xs rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-slate-700 shadow-sm h-[38px] bg-white cursor-pointer min-w-[170px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="ALL">-- SEMUA SEGMENT --</option>
                {segmentList.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Akad Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                JENIS AKAD:
              </label>
              <select
                name="akad"
                disabled={isLoading}
                value={akd}
                onChange={(e) => setAkd(e.target.value)}
                className="border-2 border-slate-400 text-slate-900 font-bold text-xs rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-slate-700 shadow-sm h-[38px] bg-white cursor-pointer min-w-[200px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="ALL">-- SEMUA AKAD --</option>
                {akadList.map((a) => (
                  <option key={a.sandi} value={a.sandi}>
                    {a.keterangan}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: themeColorBtnFilterReport }}
              className="text-white text-xs font-black px-5 rounded-md shadow-md transition-opacity hover:opacity-90 flex items-center justify-center gap-2 h-[38px] uppercase tracking-wide border border-white/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MEMPROSES...</span>
                </>
              ) : (
                <span>TERAPKAN FILTER</span>
              )}
            </button>
          </form>

          {/* Right Side: Download Excel with Loading State */}
          <div className="w-full md:w-auto flex justify-end">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isDownloading || isLoading}
              style={{ backgroundColor: themeColorBtnDownload }}
              className="text-white text-xs font-black px-5 rounded-md shadow-md transition-opacity hover:opacity-90 flex items-center gap-2 h-[38px] uppercase tracking-wide border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  MENGUNDUH EXCEL...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  DOWNLOAD EXCEL
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
