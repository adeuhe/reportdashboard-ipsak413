import React from "react";
import Header from "@/lib/report-laporan-penerapan-haircut/component/Header";
import MetadataCard from "@/lib/report-laporan-penerapan-haircut/component/MetadataCard";
import FilterCard from "@/lib/report-laporan-penerapan-haircut/component/FilterCard";
import ContentCard from "@/lib/report-laporan-penerapan-haircut/component/ContentCard";
import { getHaircutInitialData, getHaircutReportData } from "@/lib/report-laporan-penerapan-haircut/services";

export default async function LaporanPenerapanHaircut(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  // Langsung ambil data dari service (Server Side Fetching)
  const initialData = await getHaircutInitialData();
  
  // Tentukan selectedDate dari searchParams atau ambil tanggal default
  let selectedDate = typeof searchParams.date === 'string' 
    ? searchParams.date 
    : (initialData.availableDates[0] || "2025-12-31");

  // Ambil data detail untuk konten berdasarkan tanggal yang dipilih
  const reportData = await getHaircutReportData(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-stretch py-10 px-4">
      {/* Top Header & Metadata Section */}
      <div className="text-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 mb-6">
        <Header namaBank={initialData.namaBank} />
        <MetadataCard 
          targetSnapshot={reportData.header.targetSnapshot} 
          tanggalCetak={reportData.header.tanggalCetak}
        />
      </div>

      {/* Main Filter Section */}
      <FilterCard
        availableDates={initialData.availableDates}
        selectedDate={selectedDate}
        themeDownloadColor={initialData.themeDownloadColor}
      />

      {/* Main Data Content */}
      <ContentCard reportData={reportData} />
    </div>
  );
}
