import React from "react";
import { getUjiStatistikData } from "@/lib/report-uji-statistik-regresi/services";
import UjiStatistikView from "@/lib/report-uji-statistik-regresi/component/UjiStatistikView";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tanggalMulai?: string, tanggalSelesai?: string, segmentId?: string, page?: string, limit?: string }>;
}) {
  const { tanggalMulai, tanggalSelesai, segmentId, page: pageStr, limit: limitStr } = await searchParams;
  
  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : 20;
  
  const initialData = await getUjiStatistikData(tanggalMulai, tanggalSelesai, segmentId, page, limit);

  return (
    <main className="min-h-screen bg-slate-100">
      <UjiStatistikView 
        initialData={initialData} 
        selectedTanggalMulai={tanggalMulai || initialData.tanggalMulai}
        selectedTanggalSelesai={tanggalSelesai || initialData.tanggalSelesai}
        selectedSegmentId={segmentId || ""}
      />
    </main>
  );
}
