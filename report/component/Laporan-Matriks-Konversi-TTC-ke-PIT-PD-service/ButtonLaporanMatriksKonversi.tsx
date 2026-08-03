"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileSpreadsheet, Loader2 } from "lucide-react";

export default function ButtonLaporanMatriksKonversi() {
  const searchParams = useSearchParams();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const targetDate = searchParams.get("date") || "2026-12-31";
      const queryParams = new URLSearchParams(searchParams.toString());
      if (!queryParams.has("date")) {
        queryParams.set("date", targetDate);
      }

      // 🛑 FIX: Tambahkan /export-excel sesuai lokasi folder di Explorer
      const response = await fetch(
        `/api/report/Laporan-Matriks-Konversi-TTC-ke-PIT-PD/export-excel?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mengunduh laporan Excel.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Matriks_Konversi_TTC_ke_PIT_PD_${targetDate}.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download Error:", err);
      alert(err.message || "Terjadi kesalahan saat mengunduh file Excel.");
    } finally { // 🛑 FIX: Hapus kata 'font' sebelum 'finally'
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memproses Excel...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4" />
          <span>Unduh Laporan (Excel)</span>
        </>
      )}
    </button>
  );
}