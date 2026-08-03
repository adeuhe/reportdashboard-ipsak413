"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";

interface Props {
  selectedSegment?: string;
}

export default function ButtonDefinisiAuditTrailFasilitasAsalUsulAnomali({ selectedSegment = "ALL" }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const queryParams = new URLSearchParams();
      if (selectedSegment && selectedSegment !== "ALL") {
        queryParams.set("segment", selectedSegment);
      }

      const response = await fetch(
        `/api/report/DefinisiAuditTrailFasilitas-Asal-Usul-Anomali/export-excel?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal mengunduh laporan Excel.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Definisi_Audit_Trail_Fasilitas_Asal_Usul_Anomali.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat mendownload file.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#009b5a] hover:bg-[#00834c] text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      {isDownloading ? "Downloading..." : "Unduh Laporan (Excel)"}
    </button>
  );
}