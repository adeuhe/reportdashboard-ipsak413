import React from "react";
import { getPemicuSicrData } from "@/lib/report-pemicu-sicr-kualitatif/services";
import PemicuSicrView from "@/lib/report-pemicu-sicr-kualitatif/component/PemicuSicrView";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function ReportPemicuSicrKualitatifPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;

  const initialData = await getPemicuSicrData(searchParams?.date);

  // Jika tidak ada date di URL, dan data tersedia, bisa saja di-redirect ke date terbaru
  if (!searchParams?.date && initialData.availableDates.length > 0) {
    redirect(`?date=${initialData.availableDates[0]}`);
  }

  const selectedDate = searchParams?.date || (initialData.availableDates[0] || "");

  return (
    <main className="min-h-screen bg-slate-50">
      <PemicuSicrView 
        initialData={initialData} 
        selectedDate={selectedDate} 
      />
    </main>
  );
}
