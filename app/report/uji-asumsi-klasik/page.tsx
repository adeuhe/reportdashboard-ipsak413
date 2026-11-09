import React from "react";
import { getUjiAsumsiKlasikData } from "@/lib/report-uji-asumsi-klasik/services";
import UjiAsumsiKlasikView from "@/lib/report-uji-asumsi-klasik/component/UjiAsumsiKlasikView";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tanggalMulai?: string; tanggalSelesai?: string; segmentId?: string; page?: string; limit?: string }>;
}) {
  const { tanggalMulai, tanggalSelesai, segmentId, page: pageStr, limit: limitStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : 5;
  
  const initialData = await getUjiAsumsiKlasikData(tanggalMulai, tanggalSelesai, segmentId, page, limit);

  const selectedTanggalMulai = initialData.defaultTanggalMulai;
  const selectedTanggalSelesai = initialData.defaultTanggalSelesai;
  const selectedSegmentId = segmentId || "ALL";

  return (
    <main>
      <UjiAsumsiKlasikView 
        initialData={initialData} 
        selectedTanggalMulai={selectedTanggalMulai} 
        selectedTanggalSelesai={selectedTanggalSelesai}
        selectedSegmentId={selectedSegmentId}
      />
    </main>
  );
}
