"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileSpreadsheet, Loader2 } from "lucide-react";

export default function ButtonSimulasiDampakFinansial() {
  const searchParams = useSearchParams();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const targetDate = searchParams.get("date") || "2026-08-03";
      const queryParams = new URLSearchParams(searchParams.toString());
      if (!queryParams.has("date")) {
        queryParams.set("date", targetDate);
      }

      // Fetch ke endpoint export-excel
      const response = await fetch(
        `/api/report/Simulasi-dampak-finansial/export-excel?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mengunduh laporan Excel.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Simulasi_Dampak_Finansial_${targetDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading excel:", error);
      alert("Gagal mengunduh laporan Excel.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      {isDownloading ? "Mengunduh..." : "Unduh Laporan (Excel)"}
    </button>
  );
}