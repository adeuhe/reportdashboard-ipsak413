import React from "react";
import { getProyeksiZMacroData } from "@/lib/report-proyeksi-z-macro/services";
import ProyeksiZMacroView from "@/lib/report-proyeksi-z-macro/component/ProyeksiZMacroView";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tanggalMulai?: string, tanggalSelesai?: string, segmentId?: string, page?: string, limit?: string }>;
}) {
  const { tanggalMulai, tanggalSelesai, segmentId, page: pageStr, limit: limitStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : 5;
  
  const initialData = await getProyeksiZMacroData(tanggalMulai, tanggalSelesai, segmentId, page, limit);

  // Set default dates if not provided
  const selectedTanggalMulai = tanggalMulai || initialData.defaultTanggalMulai;
  const selectedTanggalSelesai = tanggalSelesai || initialData.defaultTanggalSelesai;
  const selectedSegmentId = segmentId || 'ALL';

  return (
    <main>
      <ProyeksiZMacroView 
        initialData={initialData} 
        selectedTanggalMulai={selectedTanggalMulai} 
        selectedTanggalSelesai={selectedTanggalSelesai}
        selectedSegmentId={selectedSegmentId}
      />
    </main>
  );
}
