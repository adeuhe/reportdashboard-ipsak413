import React from "react";
import { redirect } from "next/navigation";
import LaporanMatriksKonversi from "@/report/component/Laporan-Matriks-Konversi-TTC-ke-PIT-PD-service/LaporanMatriksKonversi";
import { getMatriksKonnversiData } from "@/report/services/Laporan-Matriks-Konversi-TTC-ke-PIT-PD-service/LaporanMatriksKonversiTTCkePITPD.service";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function LaporanMatriksKonversiPage({
  searchParams,
}: PageProps) {
  const resolvedParams = await searchParams;

  // Jika belum ada parameter date, redirect ke akhir tahun berjalan
  if (!resolvedParams?.date) {
    const currentYear = new Date().getFullYear();
    redirect(`?date=${currentYear}-12-31`);
  }

  const reportData = await getMatriksKonnversiData(resolvedParams.date);

  return (
    <main className="min-h-screen bg-white">
      <LaporanMatriksKonversi initialData={reportData} />
    </main>
  );
}